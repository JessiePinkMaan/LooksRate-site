export const QUOTE_LIMIT = 12;
export const QUOTE_MIN_LENGTH = 8;
export const QUOTE_MAX_LENGTH = 220;

export type QuoteCheck =
  | { ok: true; text: string }
  | { ok: false; reason: "short" | "long" };

/**
 * Нормализует пользовательскую цитату: схлопывает пробелы/переносы,
 * отсекает пустоту и проверяет границы. Чистая функция - покрыта тестом.
 */
export function checkQuote(value: unknown): QuoteCheck {
  if (typeof value !== "string") return { ok: false, reason: "short" };

  const text = value.replace(/\s+/g, " ").trim();
  if (text.length < QUOTE_MIN_LENGTH) return { ok: false, reason: "short" };
  if (text.length > QUOTE_MAX_LENGTH) return { ok: false, reason: "long" };

  return { ok: true, text };
}
