"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  SlimeCharacter,
  DEFAULT_SLIME_COLOR,
} from "@/components/character/SlimeCharacter";
import type { CosmeticItem } from "@/lib/types";

// Tint colours available when customizing glasses / hat cosmetics
const PRESET_COLORS = [
  "#6366F1",
  "#818CF8",
  "#22C55E",
  "#86EFAC",
  "#F59E0B",
  "#FB923C",
  "#EF4444",
  "#F472B6",
  "#38BDF8",
  "#A78BFA",
  "#E5E7EB",
  "#64748B",
];

// Equipment-slot display labels (color handled separately)
const SLOT_LABELS: Record<string, string> = {
  glasses: "Glasses",
  hat: "Hat",
  background: "Background",
};

export default function CharacterPage() {
  const { user, fetchUser, updateUser } = useUserStore();
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchCosmetics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCosmetics() {
    try {
      const res = await fetch("/api/character");
      if (res.ok) {
        const data = await res.json();
        setCosmetics(data.cosmetics);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEquip(id: string, slot: string) {
    const res = await fetch("/api/character", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, slot, equip: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setCosmetics(data.cosmetics);
    }
  }

  async function handleUnequip(id: string) {
    const res = await fetch("/api/character", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, equip: false }),
    });
    if (res.ok) {
      const data = await res.json();
      setCosmetics(data.cosmetics);
    }
  }

  async function handleCosmeticColor(id: string, color: string) {
    const res = await fetch("/api/character", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, color }),
    });
    if (res.ok) {
      const data = await res.json();
      setCosmetics(data.cosmetics);
    }
  }

  // Selecting a slime color just updates characterColor directly
  async function handleSelectColor(color: string) {
    await updateUser({ characterColor: color });
  }

  if (loading || !user) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <span className="text-[#6B7280] text-sm animate-pulse">
          Loading character…
        </span>
      </div>
    );
  }

  const equippedMap = Object.fromEntries(
    cosmetics.filter((c) => c.equipped).map((c) => [c.slot, c]),
  );

  // Unlocked slime colours (slot="color" cosmetics)
  const unlockedColors = cosmetics.filter((c) => c.slot === "color");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#E5E7EB]">Character</h1>
        <p className="text-[#6B7280] text-sm mt-0.5">
          Customize your slime as you level up.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* ── Left: slime preview ── */}
        <Card className="flex flex-col items-center py-8 gap-4">
          <SlimeCharacter
            color={user.characterColor}
            equipped={{
              hat: equippedMap.hat
                ? { color: equippedMap.hat.color }
                : undefined,
              glasses: equippedMap.glasses
                ? { color: equippedMap.glasses.color }
                : undefined,
              background: equippedMap.background
                ? { color: equippedMap.background.color }
                : undefined,
            }}
            scale={1}
          />
          <div className="text-center">
            <div className="text-sm font-semibold text-[#E5E7EB]">
              Level {user.level}
            </div>
            <div className="text-xs text-[#6B7280]">
              Streak: {user.streak} days
            </div>
          </div>
        </Card>

        {/* ── Right: customization panels ── */}
        <div className="space-y-4">
          {/* Color selector */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Slime Color
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Default colour — always unlocked */}
              <button
                title="Default"
                onClick={() => handleSelectColor(DEFAULT_SLIME_COLOR)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  user.characterColor === DEFAULT_SLIME_COLOR
                    ? "border-white scale-110"
                    : "border-[#374151]"
                }`}
                style={{ backgroundColor: DEFAULT_SLIME_COLOR }}
              />
              {/* Unlocked colours */}
              {unlockedColors.map((c) => (
                <button
                  key={c.id}
                  title={c.color}
                  onClick={() => handleSelectColor(c.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    user.characterColor === c.color
                      ? "border-white scale-110"
                      : "border-[#374151]"
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
              {unlockedColors.length === 0 && (
                <p className="text-xs text-[#4B5563]">
                  Reach Level 1 to unlock new colours.
                </p>
              )}
            </div>
          </Card>

          {/* Equipment slots: glasses, hat, background */}
          {user.level === 0 ? (
            <Card>
              <p className="text-sm text-[#6B7280] text-center py-4">
                Reach Level 2 to unlock glasses, Level 3 for a hat, Level 4 for
                backgrounds.
              </p>
            </Card>
          ) : (
            (["glasses", "hat", "background"] as const).map((slot) => {
              const unlocked = cosmetics.filter((c) => c.slot === slot);
              const equipped = equippedMap[slot];
              return (
                <Card key={slot}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#E5E7EB]">
                      {SLOT_LABELS[slot]}
                    </span>
                    {equipped && <Badge color="success">Equipped</Badge>}
                  </div>

                  {unlocked.length === 0 ? (
                    <p className="text-xs text-[#4B5563]">
                      Not yet unlocked. Keep leveling up!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {unlocked.map((cosm) => (
                        <CosmeticRow
                          key={cosm.id}
                          cosmetic={cosm}
                          isEquipped={cosm.equipped}
                          onEquip={() => handleEquip(cosm.id, slot)}
                          onUnequip={() => handleUnequip(cosm.id)}
                          onColorChange={(color) =>
                            handleCosmeticColor(cosm.id, color)
                          }
                        />
                      ))}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Single cosmetic row ──────────────────────────────────────────────────────

function CosmeticRow({
  cosmetic,
  isEquipped,
  onEquip,
  onUnequip,
  onColorChange,
}: {
  cosmetic: CosmeticItem;
  isEquipped: boolean;
  onEquip: () => void;
  onUnequip: () => void;
  onColorChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg border border-[#374151] shrink-0"
        style={{ backgroundColor: cosmetic.color }}
      />
      <div className="flex-1">
        <div className="text-xs text-[#6B7280]">
          Unlocked at level {cosmetic.unlockedAt}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {PRESET_COLORS.slice(0, 8).map((color) => (
            <button
              key={color}
              title={color}
              onClick={() => onColorChange(color)}
              className={`w-4 h-4 rounded-full border transition-transform hover:scale-110 ${
                cosmetic.color === color ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <Button
        size="sm"
        variant={isEquipped ? "secondary" : "primary"}
        onClick={isEquipped ? onUnequip : onEquip}
      >
        {isEquipped ? "Unequip" : "Equip"}
      </Button>
    </div>
  );
}
