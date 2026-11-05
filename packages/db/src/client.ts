import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL не задан. Скопируй .env.example в .env и заполни.",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Ленивый клиент: соединение создаётся при первом запросе, а не при импорте.
 * Это позволяет собирать приложение без живой БД (CI) и не требует
 * DATABASE_URL на этапе `next build`.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = (client as unknown as Record<PropertyKey, unknown>)[
      property
    ];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { PrismaClient };
