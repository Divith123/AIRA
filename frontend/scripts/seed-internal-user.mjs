import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { config as loadDotenv } from "dotenv";
import { PrismaClient } from "@prisma/client";

loadDotenv({ path: ".env.local" });
loadDotenv();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});

const INTERNAL_TEST_EMAIL =
  process.env.INTERNAL_TEST_EMAIL?.trim().toLowerCase() ||
  "divithselvam23@gmail.com";
const INTERNAL_TEST_PASSWORD =
  process.env.INTERNAL_TEST_PASSWORD?.trim() || "Ninja@2005";

async function main() {
  const role = await prisma.role.upsert({
    where: { id: "role_admin" },
    update: {
      name: "Administrator",
      description: "System administrator role",
      permissions: JSON.stringify(["*"]),
      isSystem: true,
    },
    create: {
      id: "role_admin",
      name: "Administrator",
      description: "System administrator role",
      permissions: JSON.stringify(["*"]),
      isSystem: true,
    },
  });

  const existing = await prisma.user.findFirst({
    where: {
      email: {
        equals: INTERNAL_TEST_EMAIL,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  const passwordHash = await hash(INTERNAL_TEST_PASSWORD, 12);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: INTERNAL_TEST_EMAIL,
        password: passwordHash,
        name: "Internal QA User",
        roleId: role.id,
        isActive: true,
        ownerId: existing.id,
      },
    });
    console.log(`Updated internal test user: ${INTERNAL_TEST_EMAIL}`);
    return;
  }

  const newUserId = randomUUID();
  await prisma.user.create({
    data: {
      id: newUserId,
      email: INTERNAL_TEST_EMAIL,
      password: passwordHash,
      name: "Internal QA User",
      roleId: role.id,
      isActive: true,
      ownerId: newUserId,
    },
  });
  console.log(`Created internal test user: ${INTERNAL_TEST_EMAIL}`);
}

main()
  .catch((error) => {
    console.error("Internal user seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
