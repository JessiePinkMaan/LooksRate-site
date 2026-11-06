import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { prisma as nodePrisma } from "@loxrate/db/client";

import { isWorkersDeployment } from "./runtime";

let workersClient: PrismaClient | undefined;

/**
 * На Workers нельзя переиспользовать TCP-соединение между запросами.
 * `maxUses: 1` закрывает сокет после каждого запроса, поэтому клиент можно
 * держать в модуле: он не тянет соединение из чужого запроса.
 */
function getWorkersClient(): PrismaClient {
  if (workersClient) return workersClient;

  const { env } = getCloudflareContext();
  const adapter = new PrismaPg({
    connectionString: env.HYPERDRIVE.connectionString,
    maxUses: 1,
  });

  workersClient = new PrismaClient({ adapter });
  return workersClient;
}

/**
 * В Docker/локально используется обычный клиент из `@loxrate/db`.
 * На Cloudflare Workers - клиент поверх Hyperdrive.
 */
export const prisma: PrismaClient = isWorkersDeployment
  ? new Proxy({} as PrismaClient, {
      get(_target, property) {
        const client = getWorkersClient();
        const value = (client as unknown as Record<PropertyKey, unknown>)[
          property
        ];
        return typeof value === "function" ? value.bind(client) : value;
      },
    })
  : nodePrisma;
