import { defineConfig } from "prisma/config";

const fallbackUrl =
  "postgresql://loxrate:loxrate@localhost:5432/loxrate?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Для миграций/интроспекции. Обычные команды получают значение из корневого .env.
    // Fallback нужен, чтобы `prisma generate` не падал в CI без .env.
    url: process.env.DATABASE_URL ?? fallbackUrl,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
