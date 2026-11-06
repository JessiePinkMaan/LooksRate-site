/**
 * Выдаёт роль OWNER существующему пользователю.
 *
 * В production регистрация создаёт роль USER, а сид с демо-персонами не
 * предназначен для прода. Поэтому владелец сначала регистрируется на сайте,
 * затем повышается этой командой.
 *
 * Запуск:
 *   pnpm db:promote <username>
 * В Docker:
 *   docker compose -f docker-compose.prod.yml --profile tools run --rm promote <username>
 */
import { prisma } from "../src/client";

const username = process.argv[2]?.trim().toLowerCase();

if (!username) {
  console.error("Укажи логин: pnpm db:promote <username>");
  process.exit(1);
}

async function main(): Promise<void> {
  const user = await prisma.user.findFirst({ where: { username } });

  if (!user) {
    console.error(
      `Пользователь "${username}" не найден. Сначала зарегистрируйся на сайте.`,
    );
    process.exitCode = 1;
    return;
  }

  if (user.role === "OWNER") {
    console.log(`"${username}" уже OWNER.`);
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { role: "OWNER" },
    }),
    prisma.auditLog.create({
      data: {
        actorId: null,
        actorRole: "SYSTEM",
        action: "user.promote_owner",
        entityType: "user",
        entityId: user.id,
        beforeJson: { role: user.role },
        afterJson: { role: "OWNER" },
      },
    }),
  ]);

  console.log(`"${username}" теперь OWNER.`);
}

main()
  .catch((error: unknown) => {
    console.error("Не удалось выдать роль:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
