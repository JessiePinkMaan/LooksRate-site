import { describe, expect, it } from "vitest";

import {
  DEFAULT_PROFILE_THEME,
  parseProfileTheme,
} from "./profile-theme";

describe("parseProfileTheme", () => {
  it("возвращает тему по умолчанию для пустого значения", () => {
    expect(parseProfileTheme(null)).toEqual(DEFAULT_PROFILE_THEME);
    expect(parseProfileTheme(undefined)).toEqual(DEFAULT_PROFILE_THEME);
    expect(parseProfileTheme("gold")).toEqual(DEFAULT_PROFILE_THEME);
  });

  it("сохраняет валидные поля", () => {
    expect(
      parseProfileTheme({ aura: "gold", item: "hat", backdrop: "gold" }),
    ).toEqual({ aura: "gold", item: "hat", backdrop: "gold" });
  });

  it("заменяет только битые поля", () => {
    expect(
      parseProfileTheme({ aura: "небо", item: "coat", backdrop: 42 }),
    ).toEqual({
      aura: DEFAULT_PROFILE_THEME.aura,
      item: "coat",
      backdrop: DEFAULT_PROFILE_THEME.backdrop,
    });
  });
});
