/**
 * Дизайн-система LoxRate. Фаза 0 — только токены-константы.
 * Компоненты (hold-кнопка, карточка с заклёпками, курсор) — Фаза 1.
 */
export const DESIGN_SYSTEM_VERSION = "0";

export const palette = {
  void: "#030303",
  basement: "#0a0a0b",
  concrete: "#131315",
  graphite: "#1c1c20",
  steel: "#6e727a",
  ash: "#e9e4da",
  blood: "#b3121b",
  bloodDeep: "#6e0a10",
  ember: "#ff3b2f",
  goldApple: "#c9a227",
  bone: "#cfc6b4",
} as const;

export type PaletteToken = keyof typeof palette;

export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
