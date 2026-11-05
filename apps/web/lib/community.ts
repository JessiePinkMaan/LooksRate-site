import "server-only";

import { rankLevel, tierLevel } from "./access";

/** Вес голоса: R4 ×1.5, R6 ×2, T3+ ×3 (ТЗ §10, §13.1). */
export function voteWeight(rank: string, tierKey: string | null): number {
  const rankPower = rankLevel(rank);
  let weight = rankPower >= 6 ? 2 : rankPower >= 4 ? 1.5 : 1;
  if (tierKey && tierLevel(tierKey) >= 3) {
    weight = Math.max(weight, 3);
  }
  return weight;
}
