import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_USER_ID } from "@/lib/constants";

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
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
