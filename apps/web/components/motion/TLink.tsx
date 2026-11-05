"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

import type { CurtainType } from "./curtain";
import { useTransition } from "./TransitionProvider";

type TLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  transitionType?: CurtainType;
};

/**
 * Внутренняя ссылка с роут-переходом (ТЗ §6.6). Модификаторы/новая вкладка
 * и reduced-motion ведут себя как обычная навигация.
 */
export function TLink({
  href,
  children,
  transitionType,
  onClick,
  ...rest
}: TLinkProps) {
  const { navigate } = useTransition();

  return (
    <a
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        navigate(href, transitionType, {
          x: event.clientX / window.innerWidth,
          y: event.clientY / window.innerHeight,
        });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
