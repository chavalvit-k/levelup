import { PrismaClient } from "@/generated/prisma/client";
import { DEFAULT_USER_ID } from "@/lib/constants";

function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Ensure default user exists ──────────────────────────────────────────────

export async function ensureDefaultUser() {
  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (!user) {
    await prisma.user.create({
      data: { id: DEFAULT_USER_ID },
    });
  }
  return (
    user ??
    (await prisma.user.findUniqueOrThrow({ where: { id: DEFAULT_USER_ID } }))
  );
}
