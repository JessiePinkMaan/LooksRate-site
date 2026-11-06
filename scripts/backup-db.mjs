/**
 * Бэкап БД через docker compose (custom-format pg_dump).
 * В prod: COMPOSE_FILE=docker-compose.prod.yml pnpm db:backup
 * Восстановление:
 *   docker compose -f <compose> exec -T postgres pg_restore -U <user> -d <db> --clean < file
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.env.ENV_FILE ?? ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const outDir = resolve("backups");
mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = resolve(outDir, `loxrate-${stamp}.dump`);
const composeFile = process.env.COMPOSE_FILE ?? "docker-compose.yml";
const user = process.env.POSTGRES_USER ?? "loxrate";
const database = process.env.POSTGRES_DB ?? "loxrate";
const command = `docker compose -f "${composeFile}" exec -T postgres pg_dump -U ${user} -Fc ${database} > "${file}"`;

console.log(`Бэкап через ${composeFile} → ${file}`);
const result = spawnSync(command, { shell: true, stdio: "inherit" });
if (result.status !== 0) {
  console.error("Бэкап не удался.");
  process.exit(1);
}
console.log(`Бэкап: ${file}`);
