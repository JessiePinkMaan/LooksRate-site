/**
 * Бэкап БД через docker compose (custom-format pg_dump).
 * Восстановление: docker compose exec -T postgres pg_restore -U loxrate -d loxrate --clean < file
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve("backups");
mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = resolve(outDir, `loxrate-${stamp}.dump`);
const command = `docker compose exec -T postgres pg_dump -U loxrate -Fc loxrate > "${file}"`;

const result = spawnSync(command, { shell: true, stdio: "inherit" });
if (result.status !== 0) {
  console.error("Бэкап не удался.");
  process.exit(1);
}
console.log(`Бэкап: ${file}`);
