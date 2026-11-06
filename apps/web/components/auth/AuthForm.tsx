"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@loxrate/ui";

import {
  loginAction,
  registerAction,
  type AuthState,
} from "@/lib/auth-actions";
import { entry } from "@/lib/content";

const EMPTY: AuthState = {};
const copy = entry.form;
const actions = entry.actions;

type AuthFormProps = {
  initialMode?: "login" | "register";
  onSuccess?: () => void;
  className?: string;
};

/** Минимальная форма входа/регистрации: логин, пароль, 18+. */
export function AuthForm({
  initialMode = "login",
  onSuccess,
  className,
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loginState, loginSubmit, loginPending] = useActionState(
    loginAction,
    EMPTY,
  );
  const [registerState, registerSubmit, registerPending] = useActionState(
    registerAction,
    EMPTY,
  );

  const isLogin = mode === "login";
  const state = isLogin ? loginState : registerState;
  const pending = isLogin ? loginPending : registerPending;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!state.success) return;
    if (onSuccessRef.current) {
      onSuccessRef.current();
      return;
    }
    router.push("/me");
    router.refresh();
  }, [state.success, router]);

  return (
    <div className={cn("w-full text-left", className)}>
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-gold-apple/80">
        {isLogin ? copy.loginTitle : copy.registerTitle}
      </p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-steel">
        {isLogin ? copy.loginSubtitle : copy.registerSubtitle}
      </p>

      <form
        action={isLogin ? loginSubmit : registerSubmit}
        className="mt-6 space-y-5"
      >
        <label className="block">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-steel">
            {copy.username}
          </span>
          <input
            name="username"
            required
            minLength={3}
            maxLength={24}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={copy.usernamePlaceholder}
            className="mt-1 w-full border-0 border-b border-graphite bg-transparent py-2 font-mono text-sm text-ash outline-none transition-colors placeholder:text-steel/40 focus:border-gold-apple"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-steel">
            {copy.password}
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder={
              isLogin
                ? copy.passwordPlaceholderLogin
                : copy.passwordPlaceholder
            }
            className="mt-1 w-full border-0 border-b border-graphite bg-transparent py-2 font-mono text-sm text-ash outline-none transition-colors placeholder:text-steel/40 focus:border-gold-apple"
          />
        </label>

        {isLogin ? null : (
          <label className="flex cursor-pointer items-start gap-2 text-[0.7rem] leading-relaxed text-steel">
            <input
              type="checkbox"
              name="age"
              required
              className="mt-0.5 accent-[#c9a227]"
            />
            {copy.age}
          </label>
        )}

        {state.error ? (
          <p
            role="alert"
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-blood"
          >
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full border border-gold-apple/50 bg-gold-apple/10 px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-gold-apple transition-colors hover:bg-gold-apple/20 disabled:opacity-50"
        >
          {pending
            ? actions.pending
            : isLogin
              ? actions.submitLogin
              : actions.submitRegister}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(isLogin ? "register" : "login")}
        className="mt-5 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-steel transition-colors hover:text-ash"
      >
        {isLogin ? actions.toRegister : actions.toLogin}
      </button>
    </div>
  );
}
