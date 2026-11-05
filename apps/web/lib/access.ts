import "server-only";

import type {
  Subscription,
  Tier,
  User,
  Video,
  VideoAccessRule,
} from "@loxrate/db";

const RANK_ORDER = ["R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7"];
const TIER_ORDER = ["T0", "T1", "T2", "T3", "T4"];

export function rankLevel(rank: string): number {
  const index = RANK_ORDER.indexOf(rank);
  return index < 0 ? 0 : index;
}

export function tierLevel(tier: string): number {
  const index = TIER_ORDER.indexOf(tier);
  return index < 0 ? 0 : index;
}

type SubscriptionWithTier = Subscription & { tier: Tier };

export type AccessDecision = { allowed: boolean; reason: string };

/**
 * Единая проверка доступа к видео (ТЗ §11, SNIPPETS S7-аналог).
 * Правила комбинируются: доступ даёт любое выполненное правило.
 */
export function decideAccess(
  user: User | null,
  video: Video & { accessRules: VideoAccessRule[] },
  subscriptions: SubscriptionWithTier[],
): AccessDecision {
  const rules = video.accessRules;
  if (rules.length === 0) {
    return { allowed: true, reason: "Публично" };
  }

  const now = new Date();
  const hasTier = (minTier: string | null): boolean => {
    if (!minTier) return true;
    return subscriptions.some((subscription) => {
      const active =
        (subscription.status === "ACTIVE" ||
          subscription.status === "GRACE") &&
        (subscription.expiresAt > now ||
          (subscription.graceUntil !== null &&
            subscription.graceUntil > now));
      return active && tierLevel(subscription.tier.key) >= tierLevel(minTier);
    });
  };

  for (const rule of rules) {
    switch (rule.type) {
      case "PUBLIC":
        return { allowed: true, reason: "Публично" };
      case "AUTH":
        if (user) return { allowed: true, reason: "Для участников" };
        break;
      case "RANK":
        if (
          user &&
          rankLevel(user.rank) >= rankLevel(rule.minRank ?? "R0")
        ) {
          return { allowed: true, reason: `Ранг ${rule.minRank}+` };
        }
        break;
      case "TIER":
        if (user && hasTier(rule.minTier)) {
          return { allowed: true, reason: `Тариф ${rule.minTier}+` };
        }
        break;
      case "RANK_AND_TIER":
        if (
          user &&
          rankLevel(user.rank) >= rankLevel(rule.minRank ?? "R0") &&
          hasTier(rule.minTier)
        ) {
          return {
            allowed: true,
            reason: `Ранг ${rule.minRank}+ и тариф ${rule.minTier}+`,
          };
        }
        break;
      case "DATE":
        if (rule.startsAt && now >= rule.startsAt) {
          return { allowed: true, reason: "Опубликовано" };
        }
        break;
      default:
        break;
    }
  }

  const requirement = rules
    .map((rule) => {
      switch (rule.type) {
        case "AUTH":
          return "нужен вход";
        case "RANK":
          return `нужен ранг ${rule.minRank}+`;
        case "TIER":
          return `нужен тариф ${rule.minTier}+`;
        case "RANK_AND_TIER":
          return `ранг ${rule.minRank}+ и тариф ${rule.minTier}+`;
        case "PURCHASE":
          return "нужна покупка";
        case "DATE":
          return "ещё не опубликовано";
        default:
          return "ограничено";
      }
    })
    .join(" или ");

  return { allowed: false, reason: requirement || "ограничено" };
}
