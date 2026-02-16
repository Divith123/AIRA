import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { serverEnv } from "./env";

type GlobalPrismaState = typeof globalThis & {
  __airaPrismaAdapter?: PrismaPg;
  __airaPrisma?: PrismaClient;
};

const globalPrisma = globalThis as GlobalPrismaState;
const adapter =
  globalPrisma.__airaPrismaAdapter ||
  new PrismaPg({
    connectionString: serverEnv.DATABASE_URL,
  });

export const prisma =
  globalPrisma.__airaPrisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (!globalPrisma.__airaPrismaAdapter) {
  globalPrisma.__airaPrismaAdapter = adapter;
}

if (!globalPrisma.__airaPrisma) {
  globalPrisma.__airaPrisma = prisma;
}
