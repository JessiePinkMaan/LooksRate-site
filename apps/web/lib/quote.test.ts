import { describe, expect, it } from "vitest";

import {
  QUOTE_MAX_LENGTH,
  QUOTE_MIN_LENGTH,
  checkQuote,
} from "./quote";

describe("checkQuote", () => {
  it("схлопывает переносы и лишние пробелы", () => {
    expect(checkQuote("  Дисциплина\n важнее   настроения  ")).toEqual({
      ok: true,
      text: "Дисциплина важнее настроения",
    });
  });

  it("отсекает пустоту и слишком короткие мысли", () => {
    expect(checkQuote("")).toEqual({ ok: false, reason: "short" });
    expect(checkQuote("   ")).toEqual({ ok: false, reason: "short" });
    expect(checkQuote("а".repeat(QUOTE_MIN_LENGTH - 1))).toEqual({
      ok: false,
      reason: "short",
    });
  });

  it("не пропускает строку длиннее лимита", () => {
    expect(checkQuote("я".repeat(QUOTE_MAX_LENGTH + 1))).toEqual({
      ok: false,
      reason: "long",
    });
  });

  it("принимает значение на границе и не-строку отклоняет", () => {
    expect(checkQuote("я".repeat(QUOTE_MAX_LENGTH))).toEqual({
      ok: true,
      text: "я".repeat(QUOTE_MAX_LENGTH),
    });
    expect(checkQuote(null)).toEqual({ ok: false, reason: "short" });
  });
});
