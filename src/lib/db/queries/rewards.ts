import { prisma } from "@/lib/db/prisma";
import type { Reward } from "@/lib/types";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function getRewards(): Promise<Reward[]> {
  const rows = await prisma.reward.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { createdAt: "desc" },
  });
  return rows as unknown as Reward[];
}

export async function getPendingRewards(): Promise<Reward[]> {
  const rows = await prisma.reward.findMany({
    where: { userId: DEFAULT_USER_ID, claimed: false },
    orderBy: { createdAt: "desc" },
  });
  return rows as unknown as Reward[];
}

export async function createReward(data: {
  type: string;
  milestone: number;
  description?: string;
}): Promise<Reward> {
  return prisma.reward.create({
    data: {
      userId: DEFAULT_USER_ID,
      type: data.type,
      milestone: data.milestone,
      description: data.description ?? "",
    },
  }) as Promise<Reward>;
}

export async function updateReward(
  id: string,
  data: { description?: string; claimed?: boolean },
): Promise<Reward> {
  return prisma.reward.update({
    where: { id },
    data,
  }) as Promise<Reward>;
}

export async function deleteReward(id: string): Promise<void> {
  await prisma.reward.delete({ where: { id } });
}
