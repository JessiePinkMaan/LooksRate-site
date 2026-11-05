"use client";

import { useEffect } from "react";

import { initPreferences } from "../effects";

/** Инициализирует настройки эффектов/звука после монтирования. */
export function EffectsProvider(): null {
  useEffect(() => {
    initPreferences();
  }, []);
  return null;
}
