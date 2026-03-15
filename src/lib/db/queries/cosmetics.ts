import { prisma } from "@/lib/db/prisma";
import type { CosmeticItem, CosmeticSlot } from "@/lib/types";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function getCosmetics(): Promise<CosmeticItem[]> {
  return prisma.cosmeticItem.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { unlockedAt: "asc" },
  }) as Promise<CosmeticItem[]>;
}

export async function getEquippedCosmetics(): Promise<CosmeticItem[]> {
  return prisma.cosmeticItem.findMany({
    where: { userId: DEFAULT_USER_ID, equipped: true },
  }) as Promise<CosmeticItem[]>;
}

export async function createCosmetic(data: {
  slot: CosmeticSlot;
  unlockedAt: number;
}): Promise<CosmeticItem> {
  return prisma.cosmeticItem.create({
    data: {
      userId: DEFAULT_USER_ID,
      slot: data.slot,
      unlockedAt: data.unlockedAt,
    },
  }) as Promise<CosmeticItem>;
}

export async function updateCosmetic(
  id: string,
  data: { color?: string; equipped?: boolean },
): Promise<CosmeticItem> {
  return prisma.cosmeticItem.update({
    where: { id },
    data,
  }) as Promise<CosmeticItem>;
}

/**
 * Equip a cosmetic and unequip any others in the same slot.
 */
export async function equipCosmetic(
  id: string,
  slot: CosmeticSlot,
): Promise<void> {
  await prisma.$transaction([
    // Unequip all in same slot
    prisma.cosmeticItem.updateMany({
      where: { userId: DEFAULT_USER_ID, slot },
      data: { equipped: false },
    }),
    // Equip this one
    prisma.cosmeticItem.update({
      where: { id },
      data: { equipped: true },
    }),
  ]);
}
