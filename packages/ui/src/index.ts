/**
 * Дизайн-система LoxRate.
 * Фаза 1: токены-константы + базовые компоненты (hold, карточка, курсор, тумблеры).
 */

export { cn } from "./cn";

export const DESIGN_SYSTEM_VERSION = "1";

export const palette = {
  void: "#030303",
  basement: "#0a0a0b",
  concrete: "#131315",
  graphite: "#1c1c20",
  steel: "#7f848e",
  ash: "#e9e4da",
  blood: "#b3121b",
  bloodDeep: "#6e0a10",
  ember: "#ff3b2f",
  goldApple: "#c9a227",
  bone: "#cfc6b4",
} as const;

export type PaletteToken = keyof typeof palette;

export {
  initPreferences,
  usePreferences,
  setPreferences,
  getPreferences,
} from "./effects";
export type { Preferences } from "./effects";

export { EffectsProvider } from "./components/EffectsProvider";
export { HoldButton } from "./components/HoldButton";
export type { HoldButtonProps } from "./components/HoldButton";
export { RivetedCard } from "./components/RivetedCard";
export type { RivetedCardProps } from "./components/RivetedCard";
export { BeltDivider } from "./components/BeltDivider";
export { EffectsToggle } from "./components/EffectsToggle";
export { SoundToggle } from "./components/SoundToggle";
