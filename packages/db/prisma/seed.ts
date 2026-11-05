/**
 * Сид dev-данных (ТЗ §25.1).
 * Идемпотентен настолько, насколько возможно для dev: конфиг/пользователи — upsert,
 * тестовые подписки/видео/комментарии пересоздаются.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { prisma } from "../src/client";
import type { Prisma } from "@prisma/client";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, "../../../content/ru");

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(contentDir, file), "utf8")) as T;
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

type RankSeed = {
  rank: string;
  name: string;
  minXp: number;
  sortOrder: number;
  perks: string[];
};

type TierSeed = {
  key: string;
  name: string;
  description: string;
  durationDays: number | null;
  seatsLimit: number | null;
  sortOrder: number;
  perks: string[];
};

type QuestSeed = {
  key: string;
  title: string;
  description: string;
  kind: "DAILY" | "WEEKLY" | "CHAIN";
  xpReward: number;
  safety: "SAFE" | "CAUTION" | "DANGER";
  sortOrder: number;
};

type AchievementSeed = {
  key: string;
  name: string;
  description: string;
  xpReward: number;
  sortOrder: number;
};

type GlossarySeed = {
  slug: string;
  term: string;
  level: number;
  safety: "SAFE" | "CAUTION" | "DANGER";
  definition: string;
  origin?: string;
  science?: string;
  loxrateTake?: string;
};

type FounderSeed = {
  alias: string;
  role: string;
  quote?: string;
  sortOrder: number;
  active: boolean;
};

type UserSeed = {
  tgId: string;
  username: string;
  displayName: string;
  role: "OWNER" | "ADMIN" | "MODERATOR" | "EDITOR" | "USER";
  rank: string;
  xp: number;
};

const testUsers: UserSeed[] = [
  { tgId: "900000001", username: "owner", displayName: "Владелец", role: "OWNER", rank: "R7", xp: 30000 },
  { tgId: "900000002", username: "admin", displayName: "Админ", role: "ADMIN", rank: "R6", xp: 16000 },
  { tgId: "900000003", username: "moderator", displayName: "Модератор", role: "MODERATOR", rank: "R4", xp: 3500 },
  { tgId: "900000004", username: "editor", displayName: "Редактор", role: "EDITOR", rank: "R4", xp: 3500 },
  { tgId: "900000010", username: "u_r1", displayName: "Новичок R1", role: "USER", rank: "R1", xp: 0 },
  { tgId: "900000011", username: "u_r4", displayName: "Боец R4", role: "USER", rank: "R4", xp: 3500 },
  { tgId: "900000012", username: "u_t2", displayName: "Подвал T2", role: "USER", rank: "R2", xp: 300 },
  { tgId: "900000013", username: "u_t2_grace", displayName: "T2 grace", role: "USER", rank: "R2", xp: 300 },
  { tgId: "900000014", username: "u_t2_expired", displayName: "T2 expired", role: "USER", rank: "R2", xp: 300 },
  { tgId: "900000015", username: "u_t3", displayName: "Совет T3", role: "USER", rank: "R5", xp: 8000 },
];

async function seedConfig(): Promise<void> {
  const ranks = readJson<{ ranks: RankSeed[] }>("ranks.json").ranks;
  for (const rank of ranks) {
    await prisma.rankConfig.upsert({
      where: { rank: rank.rank },
      update: {
        name: rank.name,
        minXp: rank.minXp,
        sortOrder: rank.sortOrder,
        perksJson: rank.perks,
      },
      create: {
        rank: rank.rank,
        name: rank.name,
        minXp: rank.minXp,
        sortOrder: rank.sortOrder,
        perksJson: rank.perks,
      },
    });
  }

  const tiers = readJson<{ tiers: TierSeed[] }>("tiers.json").tiers;
  for (const tier of tiers) {
    await prisma.tier.upsert({
      where: { key: tier.key },
      update: {
        name: tier.name,
        description: tier.description,
        durationDays: tier.durationDays,
        seatsLimit: tier.seatsLimit,
        sortOrder: tier.sortOrder,
        perksJson: tier.perks,
        priceJson: undefined,
        active: true,
      },
      create: {
        key: tier.key,
        name: tier.name,
        description: tier.description,
        durationDays: tier.durationDays,
        seatsLimit: tier.seatsLimit,
        sortOrder: tier.sortOrder,
        perksJson: tier.perks,
        active: true,
      },
    });
  }

  const quests = readJson<{ quests: QuestSeed[] }>("quests.json").quests;
  for (const quest of quests) {
    await prisma.quest.upsert({
      where: { key: quest.key },
      update: {
        title: quest.title,
        description: quest.description,
        kind: quest.kind,
        xpReward: quest.xpReward,
        safety: quest.safety,
        sortOrder: quest.sortOrder,
      },
      create: {
        key: quest.key,
        title: quest.title,
        description: quest.description,
        kind: quest.kind,
        xpReward: quest.xpReward,
        safety: quest.safety,
        sortOrder: quest.sortOrder,
      },
    });
  }

  const achievements =
    readJson<{ achievements: AchievementSeed[] }>("achievements.json").achievements;
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        name: achievement.name,
        description: achievement.description,
        xpReward: achievement.xpReward,
        sortOrder: achievement.sortOrder,
      },
      create: {
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        xpReward: achievement.xpReward,
        sortOrder: achievement.sortOrder,
      },
    });
  }

  const glossary = readJson<{ terms: GlossarySeed[] }>("glossary.json").terms;
  for (const term of glossary) {
    await prisma.glossaryTerm.upsert({
      where: { slug: term.slug },
      update: {
        term: term.term,
        level: term.level,
        safety: term.safety,
        definition: term.definition,
        origin: term.origin ?? null,
        science: term.science ?? null,
        loxrateTake: term.loxrateTake ?? null,
      },
      create: {
        slug: term.slug,
        term: term.term,
        level: term.level,
        safety: term.safety,
        definition: term.definition,
        origin: term.origin ?? null,
        science: term.science ?? null,
        loxrateTake: term.loxrateTake ?? null,
      },
    });
  }

  const founders = readJson<{ founders: FounderSeed[] }>("founders.json").founders;
  await prisma.founder.deleteMany();
  for (const founder of founders) {
    await prisma.founder.create({
      data: {
        alias: founder.alias,
        role: founder.role,
        quote: founder.quote ?? null,
        sortOrder: founder.sortOrder,
        active: founder.active,
      },
    });
  }
}

async function seedContentBlocks(): Promise<void> {
  const blocks: Array<{ key: string; file: string }> = [
    { key: "manifest", file: "manifest.json" },
    { key: "codex", file: "codex.json" },
    { key: "microcopy", file: "microcopy.json" },
    { key: "faq", file: "faq.json" },
    { key: "slogans", file: "slogans.json" },
  ];

  for (const block of blocks) {
    const json = readJson<Prisma.InputJsonValue>(block.file);
    await prisma.contentBlock.upsert({
      where: { key_locale: { key: block.key, locale: "ru" } },
      update: { json },
      create: { key: block.key, locale: "ru", json },
    });
  }
}

async function seedUsers(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  for (const user of testUsers) {
    const record = await prisma.user.upsert({
      where: { tgId: user.tgId },
      update: {
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        rank: user.rank,
        xp: user.xp,
      },
      create: {
        tgId: user.tgId,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        rank: user.rank,
        xp: user.xp,
        ageConfirmedAt: new Date(),
        termsAcceptedAt: new Date(),
      },
    });
    ids.set(user.tgId, record.id);
  }

  return ids;
}

async function seedSubscriptions(ids: Map<string, string>): Promise<void> {
  const tierT2 = await prisma.tier.findUniqueOrThrow({ where: { key: "T2" } });
  const tierT3 = await prisma.tier.findUniqueOrThrow({ where: { key: "T3" } });

  await prisma.subscription.deleteMany({
    where: { userId: { in: [...ids.values()] } },
  });

  const subscriptions = [
    {
      userId: ids.get("900000012")!,
      tierId: tierT2.id,
      expiresAt: daysFromNow(20),
      status: "ACTIVE" as const,
    },
    {
      userId: ids.get("900000013")!,
      tierId: tierT2.id,
      expiresAt: daysFromNow(-2),
      graceUntil: daysFromNow(1),
      status: "GRACE" as const,
    },
    {
      userId: ids.get("900000014")!,
      tierId: tierT2.id,
      expiresAt: daysFromNow(-10),
      status: "EXPIRED" as const,
    },
    {
      userId: ids.get("900000015")!,
      tierId: tierT3.id,
      expiresAt: daysFromNow(60),
      status: "ACTIVE" as const,
    },
  ];

  for (const subscription of subscriptions) {
    await prisma.subscription.create({
      data: { ...subscription, source: "seed" },
    });
  }
}

async function seedVideos(ids: Map<string, string>): Promise<string[]> {
  const ownerId = ids.get("900000001");

  const videoSeeds = [
    {
      slug: "welcome-to-vault",
      title: "Первый вход в Подвал",
      description: "Что такое Vault и как здесь всё устроено.",
      access: { type: "PUBLIC" as const },
    },
    {
      slug: "discipline-basics",
      title: "Дисциплина: база",
      description: "Сон, вода, движение — минимальный набор.",
      access: { type: "AUTH" as const },
    },
    {
      slug: "rank-r3-brief",
      title: "Брифинг для Бойцов",
      description: "Видео уровня ранга R3.",
      access: { type: "RANK" as const, minRank: "R3" },
    },
    {
      slug: "basement-session",
      title: "Сессия Подвала",
      description: "Видео уровня тарифа T2.",
      access: { type: "TIER" as const, minTier: "T2" },
    },
    {
      slug: "council-only",
      title: "Только для Совета",
      description: "Комбинированное правило: ранг R4 и тариф T2.",
      access: { type: "RANK_AND_TIER" as const, minRank: "R4", minTier: "T2" },
    },
  ];

  const slugs = videoSeeds.map((video) => video.slug);
  await prisma.video.deleteMany({ where: { slug: { in: slugs } } });

  const createdIds: string[] = [];
  for (const video of videoSeeds) {
    const record = await prisma.video.create({
      data: {
        slug: video.slug,
        title: video.title,
        description: video.description,
        status: "READY",
        duration: 600,
        publishAt: daysFromNow(-1),
        createdById: ownerId ?? null,
        category: "basement",
        tags: ["seed", "test"],
        accessRules: {
          create: [
            {
              type: video.access.type,
              minRank: "minRank" in video.access ? video.access.minRank : null,
              minTier: "minTier" in video.access ? video.access.minTier : null,
            },
          ],
        },
      },
    });
    createdIds.push(record.id);
  }
  return createdIds;
}

async function seedCommunity(
  ids: Map<string, string>,
  videoIds: string[],
): Promise<void> {
  const authorIds = [...ids.values()];
  const targetVideoId = videoIds[0];

  if (targetVideoId) {
    await prisma.comment.deleteMany({
      where: { targetType: "video", targetId: targetVideoId },
    });

    const bodies = [
      "Согласен. Удобным быть — значит исчезнуть.",
      "Первый раз вижу, чтобы про это говорили честно.",
      "Кодекс — в точку.",
      "А что насчёт сна? У меня с ним беда.",
      "Дисциплина важнее мотивации.",
      "Не ожидал такого от проекта про рейтинг.",
      "Подписался на канал после этого.",
      "Тишина сильнее оправданий — забрал в цитаты.",
    ];

    for (let i = 0; i < 30; i += 1) {
      const userId = authorIds[i % authorIds.length]!;
      await prisma.comment.create({
        data: {
          userId,
          targetType: "video",
          targetId: targetVideoId,
          body: `${bodies[i % bodies.length]} (${i + 1})`,
          status: "VISIBLE",
        },
      });
    }
  }

  await prisma.idea.deleteMany({
    where: { user: { tgId: { startsWith: "9000000" } } },
  });

  const ideaTitles = [
    "Добавить тёмную тему для админки",
    "Раздел с разбором мифов",
    "Еженедельный дайджест в Telegram",
    "Теги для видео",
    "Экспорт профиля",
    "Закрытые опросы для T2",
    "Достижения за серию",
    "Календарь ритуалов",
    "Мобильное приложение",
    "Голосования за темы видео",
    "Реферальная программа",
    "Публичные профили",
    "Поиск по лору",
    "Сезонные награды",
    "Интеграция с ботом",
  ];
  const categories = ["site", "content", "bot", "events", "other"];

  for (let i = 0; i < ideaTitles.length; i += 1) {
    const userId = authorIds[i % authorIds.length]!;
    await prisma.idea.create({
      data: {
        userId,
        title: ideaTitles[i]!,
        body: "Черновое предложение из сида для проверки пагинации и модерации.",
        category: categories[i % categories.length]!,
        status: "NEW",
      },
    });
  }
}

async function main(): Promise<void> {
  await seedConfig();
  await seedContentBlocks();
  const ids = await seedUsers();
  await seedSubscriptions(ids);
  const videoIds = await seedVideos(ids);
  await seedCommunity(ids, videoIds);

  console.log("Seed завершён: конфиг, контент, пользователи, подписки, видео, сообщество.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed упал:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
