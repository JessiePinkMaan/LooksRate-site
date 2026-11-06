export const PROFILE_AURAS = ["gold", "blood", "steel", "void"] as const;
export type ProfileAura = (typeof PROFILE_AURAS)[number];

export const PROFILE_ITEMS = ["none", "hat", "scarf", "coat", "chain"] as const;
export type ProfileItem = (typeof PROFILE_ITEMS)[number];

export const PROFILE_BACKDROPS = ["concrete", "void", "gold"] as const;
export type ProfileBackdrop = (typeof PROFILE_BACKDROPS)[number];

export type ProfileTheme = {
  aura: ProfileAura;
  item: ProfileItem;
  backdrop: ProfileBackdrop;
};

export const DEFAULT_PROFILE_THEME: ProfileTheme = {
  aura: "void",
  item: "none",
  backdrop: "concrete",
};

function isOneOf<T extends string>(
  value: unknown,
  options: readonly T[],
): value is T {
  return typeof value === "string" && options.includes(value as T);
}

/** JSON из БД может быть старым или битым — всегда возвращаем валидную тему. */
export function parseProfileTheme(value: unknown): ProfileTheme {
  if (!value || typeof value !== "object") return DEFAULT_PROFILE_THEME;
  const record = value as Record<string, unknown>;

  return {
    aura: isOneOf(record.aura, PROFILE_AURAS)
      ? record.aura
      : DEFAULT_PROFILE_THEME.aura,
    item: isOneOf(record.item, PROFILE_ITEMS)
      ? record.item
      : DEFAULT_PROFILE_THEME.item,
    backdrop: isOneOf(record.backdrop, PROFILE_BACKDROPS)
      ? record.backdrop
      : DEFAULT_PROFILE_THEME.backdrop,
  };
}
