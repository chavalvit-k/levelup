import { prisma, ensureDefaultUser } from "@/lib/db/prisma";
import type { User } from "@/lib/types";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function getUser(): Promise<User> {
  await ensureDefaultUser();
  return prisma.user.findUniqueOrThrow({ where: { id: DEFAULT_USER_ID } });
}

export async function updateUser(
  data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
) {
  return prisma.user.update({
    where: { id: DEFAULT_USER_ID },
    data,
  });
}
