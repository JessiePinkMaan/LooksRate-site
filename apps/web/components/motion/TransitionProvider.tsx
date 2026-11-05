"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { cn, usePreferences } from "@loxrate/ui";

import type { Curtain, CurtainOrigin, CurtainType } from "./curtain";
import { getLenis } from "./scroll";

type TransitionContextValue = {
  navigate: (
    href: string,
    type?: CurtainType,
    origin?: CurtainOrigin,
  ) => void;
  demo: (type: CurtainType) => void;
  isTransitioning: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const ROUTE_TYPES: CurtainType[] = [1, 9, 6];

/**
 * Роут-переходы (ТЗ §6.6): cover → router.push → ready → scrollTo(0) → reveal.
 * При reduced-motion / без WebGL — кросс-фейд 200 мс. Watchdog 4 с.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { effects } = usePreferences();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const curtainRef = useRef<Curtain | null>(null);
  const pendingRef = useRef<(() => void) | null>(null);
  const lastTypeRef = useRef<CurtainType | null>(null);
  const [isTransitioning, setTransitioning] = useState(false);

  // Ленивая инициализация WebGL-занавеса (отдельный чанк).
  useEffect(() => {
    let disposed = false;
    void (async () => {
      try {
        const { Curtain: CurtainClass } = await import("./curtain");
        if (disposed || !canvasRef.current) return;
        curtainRef.current = new CurtainClass(canvasRef.current);
      } catch (error) {
        console.error(
          "[curtain] WebGL недоступен, используем кросс-фейд:",
          error,
        );
      }
    })();

    return () => {
      disposed = true;
      curtainRef.current?.dispose();
      curtainRef.current = null;
    };
  }, []);

  // Сигнал готовности маршрута.
  useEffect(() => {
    pendingRef.current?.();
    pendingRef.current = null;
  }, [pathname]);

  const fallbackNavigate = useCallback(
    (href: string) => {
      setTransitioning(true);
      document.documentElement.dataset.transition = "fallback";
      window.setTimeout(() => {
        router.push(href);
        window.setTimeout(() => {
          delete document.documentElement.dataset.transition;
          setTransitioning(false);
        }, 200);
      }, 200);
    },
    [router],
  );

  const resetScroll = useCallback(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const navigate = useCallback(
    (href: string, type?: CurtainType, origin?: CurtainOrigin) => {
      if (href === pathname) return;

      const curtain = curtainRef.current;
      if (!effects || !curtain) {
        fallbackNavigate(href);
        return;
      }

      setTransitioning(true);

      let chosen = type;
      if (!chosen) {
        const pool = ROUTE_TYPES.filter(
          (item) => item !== lastTypeRef.current,
        );
        chosen = pool[Math.floor(Math.random() * pool.length)] ?? 9;
      }
      lastTypeRef.current = chosen;

      const watchdog = window.setTimeout(() => {
        void curtain.reveal();
        setTransitioning(false);
      }, 4000);

      void (async () => {
        await curtain.cover(chosen, origin);

        const ready = new Promise<void>((resolve) => {
          pendingRef.current = resolve;
        });
        router.push(href);

        await Promise.race([
          ready,
          new Promise<void>((resolve) => window.setTimeout(resolve, 2500)),
        ]);

        resetScroll();
        window.clearTimeout(watchdog);
        await curtain.reveal();
        setTransitioning(false);
      })();
    },
    [effects, fallbackNavigate, pathname, resetScroll, router],
  );

  const demo = useCallback(
    (type: CurtainType) => {
      const curtain = curtainRef.current;
      if (!effects || !curtain) return;

      setTransitioning(true);
      void (async () => {
        await curtain.cover(type, { x: 0.5, y: 0.5 });
        await new Promise<void>((resolve) =>
          window.setTimeout(resolve, 350),
        );
        await curtain.reveal();
        setTransitioning(false);
      })();
    },
    [effects],
  );

  const value = useMemo(
    () => ({ navigate, demo, isTransitioning }),
    [navigate, demo, isTransitioning],
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <canvas
        ref={canvasRef}
        className={cn(
          "pointer-events-none fixed inset-0 z-[200] h-full w-full",
          isTransitioning ? "block" : "hidden",
        )}
        aria-hidden
      />
      <div className="transition-fallback" aria-hidden />
    </TransitionContext.Provider>
  );
}

export function useTransition(): TransitionContextValue {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error(
      "useTransition должен использоваться внутри TransitionProvider",
    );
  }
  return context;
}
