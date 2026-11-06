import { beforeEach, describe, expect, it } from "vitest";

import {
  checkRateLimit,
  clearRateLimit,
  resetRateLimits,
} from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("пропускает попытки в пределах лимита и блокирует лишние", () => {
    const now = 1_000;
    expect(checkRateLimit("login:alice", 2, 60_000, now).allowed).toBe(true);
    expect(checkRateLimit("login:alice", 2, 60_000, now + 10).allowed).toBe(
      true,
    );

    const blocked = checkRateLimit("login:alice", 2, 60_000, now + 20);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("сбрасывается после окна", () => {
    const now = 5_000;
    checkRateLimit("register:1.2.3.4", 1, 1_000, now);
    expect(checkRateLimit("register:1.2.3.4", 1, 1_000, now + 500).allowed).toBe(
      false,
    );
    expect(
      checkRateLimit("register:1.2.3.4", 1, 1_000, now + 1_001).allowed,
    ).toBe(true);
  });

  it("clearRateLimit снимает блокировку", () => {
    checkRateLimit("login:bob", 1, 60_000, 0);
    expect(checkRateLimit("login:bob", 1, 60_000, 1).allowed).toBe(false);
    clearRateLimit("login:bob");
    expect(checkRateLimit("login:bob", 1, 60_000, 2).allowed).toBe(true);
  });
});
