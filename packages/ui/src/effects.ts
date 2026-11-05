"use client";

import { useSyncExternalStore } from "react";

/**
 * Глобальные настройки «эффектов» и «звука» (ТЗ §4.5, §18).
 * «Эффекты» выключают курсор, тяжёлые анимации и шейдеры; по умолчанию
 * подхватывается `prefers-reduced-motion`. Настройки — в localStorage.
 */

export type Preferences = {
  effects: boolean;
  sound: boolean;
};

const STORAGE_KEY = "loxrate:prefs";

const SERVER_PREFS: Preferences = { effects: true, sound: false };

let state: Preferences = SERVER_PREFS;
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function applyToDom(prefs: Preferences): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.effects = prefs.effects ? "on" : "off";
  document.documentElement.dataset.sound = prefs.sound ? "on" : "off";
}

function readStorage(): Preferences {
  if (typeof window === "undefined") return SERVER_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SERVER_PREFS;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      effects: parsed.effects !== false,
      sound: parsed.sound === true,
    };
  } catch {
    return SERVER_PREFS;
  }
}

/** Вызывается один раз на клиенте после монтирования. */
export function initPreferences(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  const stored = readStorage();
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  state = prefersReduced ? { ...stored, effects: false } : stored;
  applyToDom(state);
  emit();
}

export function getPreferences(): Preferences {
  return state;
}

export function getServerPreferences(): Preferences {
  return SERVER_PREFS;
}

export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setPreferences(patch: Partial<Preferences>): void {
  state = { ...state, ...patch };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  applyToDom(state);
  emit();
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(
    subscribePreferences,
    getPreferences,
    getServerPreferences,
  );
}
