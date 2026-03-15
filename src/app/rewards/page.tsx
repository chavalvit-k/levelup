"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CosmeticIcon } from "@/components/character/CosmeticIcon";
import type { Reward } from "@/lib/types";
import {
  STREAK_REWARD_INTERVAL,
  LEVEL_CUSTOM_REWARD_INTERVAL,
  COSMETIC_SLOTS,
  MAX_LEVEL,
} from "@/lib/constants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nextStreakMilestone(streak: number): number {
  return (
    (Math.floor(streak / STREAK_REWARD_INTERVAL) + 1) * STREAK_REWARD_INTERVAL
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const { user, fetchUser } = useUserStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchUser();
    fetchRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRewards() {
    try {
      const res = await fetch("/api/rewards");
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards ?? data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function claimReward(id: string, description: string) {
    const res = await fetch(`/api/rewards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimed: true, description }),
    });
    if (res.ok) {
      setRewards((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, claimed: true, description } : r,
        ),
      );
    }
  }

  async function saveDescription(id: string) {
    const res = await fetch(`/api/rewards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: editText }),
    });
    if (res.ok) {
      setRewards((prev) =>
        prev.map((r) => (r.id === id ? { ...r, description: editText } : r)),
      );
    }
    setEditingId(null);
  }

  const pending = rewards.filter((r) => !r.claimed);
  const claimed = rewards.filter((r) => r.claimed);

  if (loading || !user) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <span className="text-[#6B7280] text-sm animate-pulse">
          Loading rewards…
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#E5E7EB]">Rewards</h1>
        <p className="text-[#6B7280] text-sm mt-0.5">
          Your progression tracks and earned milestones.
        </p>
      </div>

      {/* ── Progression Tracks ── */}
      <div className="space-y-4 mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          Progression Tracks
        </h2>
        <StreakTrack streak={user.streak} />
        <LevelTrack level={user.level} />
      </div>

      {/* ── Earned Rewards ── */}
      {rewards.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-[#9CA3AF] text-sm">No rewards yet.</p>
          <p className="text-[#4B5563] text-xs mt-1">
            Complete streaks and reach level milestones to earn rewards.
          </p>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
                Pending · {pending.length}
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {pending.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      editingId={editingId}
                      editText={editText}
                      onStartEdit={(id, desc) => {
                        setEditingId(id);
                        setEditText(desc || "");
                      }}
                      onSaveEdit={saveDescription}
                      onCancelEdit={() => setEditingId(null)}
                      onEditText={setEditText}
                      onClaim={claimReward}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {claimed.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
                Claimed · {claimed.length}
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {claimed.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      editingId={editingId}
                      editText={editText}
                      onStartEdit={(id, desc) => {
                        setEditingId(id);
                        setEditText(desc || "");
                      }}
                      onSaveEdit={saveDescription}
                      onCancelEdit={() => setEditingId(null)}
                      onEditText={setEditText}
                      onClaim={claimReward}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Streak Progression Track ─────────────────────────────────────────────────

function StreakTrack({ streak }: { streak: number }) {
  const currentMilestoneBase =
    Math.floor(streak / STREAK_REWARD_INTERVAL) * STREAK_REWARD_INTERVAL;
  const next = nextStreakMilestone(streak);
  const progressInSegment = streak - currentMilestoneBase;
  const progressPercent = (progressInSegment / STREAK_REWARD_INTERVAL) * 100;

  // Show milestones from 0 to next+2 buckets
  const visibleMilestones: number[] = [];
  const totalMilestones = Math.min(
    (Math.floor(streak / STREAK_REWARD_INTERVAL) + 3) * STREAK_REWARD_INTERVAL,
    60,
  );
  for (let m = 0; m <= totalMilestones; m += STREAK_REWARD_INTERVAL) {
    visibleMilestones.push(m);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-semibold text-[#E5E7EB]">
            Streak Track
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-[#FB923C]">{streak}</span>
          <span className="text-xs text-[#6B7280]"> / {next} days</span>
        </div>
      </div>

      {/* Milestone nodes */}
      <div className="relative flex items-center gap-0 overflow-x-auto pb-1">
        {visibleMilestones.map((m, i) => {
          const isPast = m < streak;
          const isCurrent = m === currentMilestoneBase && m < next;
          const isNext = m === next;

          return (
            <div key={m} className="flex items-center shrink-0">
              {/* Connector line (before each node except first) */}
              {i > 0 && (
                <div className="relative h-1.5 w-10 overflow-hidden rounded-full bg-[#1F2937]">
                  {isPast && !isCurrent && (
                    <div className="absolute inset-0 bg-[#FB923C]" />
                  )}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-[#FB923C]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  )}
                </div>
              )}

              {/* Node */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    isPast
                      ? "bg-[#FB923C] border-[#FB923C] text-white"
                      : isNext
                        ? "bg-[#1F2937] border-[#FB923C] text-[#FB923C]"
                        : "bg-[#111827] border-[#374151] text-[#4B5563]"
                  }`}
                >
                  {isPast ? "✓" : m === 0 ? "0" : "🎁"}
                </div>
                <span
                  className={`text-[10px] tabular-nums ${
                    isNext ? "text-[#FB923C] font-semibold" : "text-[#4B5563]"
                  }`}
                >
                  {m === 0 ? "0" : `${m}d`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#6B7280] mt-3">
        {streak === 0
          ? "Complete all daily tasks to start your streak."
          : `${next - streak} more day${next - streak === 1 ? "" : "s"} until next reward slot.`}
      </p>
    </Card>
  );
}

// ─── Level Cosmetic preview data ──────────────────────────────────────────────

// Cosmetic slot display metadata
const COSMETIC_META: Record<string, { label: string; color: string }> = {
  color: { label: "Color", color: "#A78BFA" },
  glasses: { label: "Glasses", color: "#38BDF8" },
  hat: { label: "Hat", color: "#818CF8" },
  background: { label: "BG", color: "#34D399" },
  reward: { label: "Reward", color: "#F59E0B" },
};

/** Determine the reward type for a level tile (mirrors cosmeticSlotForLevel). */
function rewardTypeForLevel(lvl: number): string {
  if (lvl % LEVEL_CUSTOM_REWARD_INTERVAL === 0) return "reward";
  const pos = (lvl % LEVEL_CUSTOM_REWARD_INTERVAL) - 1; // 0,1,2,3
  return COSMETIC_SLOTS[pos];
}

// ─── Level Milestone Track ────────────────────────────────────────────────────

function LevelTrack({ level }: { level: number }) {
  // ALL levels from 1 to MAX_LEVEL
  const allLevels = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);
  const currentRef = useRef<HTMLDivElement>(null);

  // Scroll the current level tile into the centre of the track on mount
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [level]);

  const nextMilestone =
    (Math.floor(level / LEVEL_CUSTOM_REWARD_INTERVAL) + 1) *
    LEVEL_CUSTOM_REWARD_INTERVAL;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">⭐</span>
          <span className="text-sm font-semibold text-[#E5E7EB]">
            Level Track
          </span>
          <span className="text-xs text-[#4B5563]">
            — all {MAX_LEVEL} levels
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-[#6366F1]">
            Level {level}
          </span>
          <span className="text-xs text-[#6B7280]">
            {" "}
            · {nextMilestone - level} to milestone
          </span>
        </div>
      </div>

      {/* Scrollable full-level timeline */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#1F2937 transparent",
        }}
      >
        {allLevels.map((lvl) => {
          const isPast = lvl < level;
          const isCurrent = lvl === level;
          const isMilestone = lvl % LEVEL_CUSTOM_REWARD_INTERVAL === 0;
          const rewardType = rewardTypeForLevel(lvl);
          const meta = COSMETIC_META[rewardType];

          return (
            <div
              key={lvl}
              ref={isCurrent ? currentRef : undefined}
              className={`shrink-0 flex flex-col items-center gap-1 rounded-lg border transition-all
                ${isMilestone ? "min-w-16 pt-2 pb-2 px-2" : "min-w-14 pt-2 pb-1.5 px-1.5"}
                ${
                  isCurrent
                    ? "border-[#6366F1] bg-[#1e1b4b] shadow-[0_0_10px_#6366F160]"
                    : isPast
                      ? "border-[#1F2937] bg-[#0F172A] opacity-40"
                      : isMilestone
                        ? "border-[#F59E0B]/35 bg-[#111827]"
                        : "border-[#1F2937] bg-[#111827]"
                }`}
            >
              {/* Level label */}
              <span
                className={`text-[10px] font-bold tabular-nums ${
                  isCurrent
                    ? "text-[#818CF8]"
                    : isPast
                      ? "text-[#374151]"
                      : "text-[#6B7280]"
                }`}
              >
                {isPast ? "✓" : `Lv ${lvl}`}
              </span>

              {/* Pixel-art cosmetic icon */}
              <CosmeticIcon
                slot={rewardType}
                color={meta.color}
                size={isMilestone ? 32 : 28}
                muted={isPast}
              />

              {/* Reward type name */}
              <span
                className="text-[9px] font-medium leading-tight text-center"
                style={{
                  color: isPast
                    ? "#374151"
                    : isCurrent
                      ? meta.color
                      : "#6B7280",
                }}
              >
                {meta.label}
              </span>

              {/* Milestone reward badge */}
              {isMilestone && (
                <div
                  className={`mt-0.5 rounded-full px-1 py-0.5 border ${
                    isPast
                      ? "border-[#1F2937] text-[#374151]"
                      : "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}
                >
                  <span className="text-[8px] font-bold leading-none">
                    +BONUS
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#4B5563] mt-3">
        {isMilestoneNext(level)
          ? "★ Next level is a milestone — cosmetic + bonus custom reward!"
          : `Cosmetics cycle: hat → glasses → shirt → pants → shoes · milestone every ${LEVEL_CUSTOM_REWARD_INTERVAL} levels`}
      </p>
    </Card>
  );
}

function isMilestoneNext(level: number): boolean {
  return (level + 1) % LEVEL_CUSTOM_REWARD_INTERVAL === 0;
}

// ─── Reward Card ──────────────────────────────────────────────────────────────

interface RewardCardProps {
  reward: Reward;
  editingId: string | null;
  editText: string;
  onStartEdit: (id: string, desc: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditText: (text: string) => void;
  onClaim: (id: string, description: string) => void;
}

function RewardCard({
  reward,
  editingId,
  editText,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditText,
  onClaim,
}: RewardCardProps) {
  const isEditing = editingId === reward.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Card className={reward.claimed ? "opacity-60" : ""}>
        <div className="flex items-start gap-4">
          <div className="text-2xl shrink-0 mt-0.5">
            {reward.claimed ? "✅" : reward.type === "streak" ? "🔥" : "⭐"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge color={reward.type === "streak" ? "streak" : "xp"}>
                {reward.type === "streak"
                  ? `${reward.milestone}-day streak`
                  : `Level ${reward.milestone}`}
              </Badge>
              {reward.claimed && <Badge color="success">Claimed</Badge>}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => onEditText(e.target.value)}
                  placeholder="What's your reward? (e.g., eat your favorite dessert)"
                  className="w-full bg-[#0F172A] border border-[#374151] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] placeholder-[#4B5563] focus:outline-none focus:border-[#6366F1]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSaveEdit(reward.id);
                    if (e.key === "Escape") onCancelEdit();
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => onSaveEdit(reward.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                {reward.description ? (
                  <p className="text-sm text-[#9CA3AF]">{reward.description}</p>
                ) : (
                  <p className="text-sm text-[#4B5563] italic">
                    No reward defined yet.
                  </p>
                )}
                {!reward.claimed && (
                  <button
                    onClick={() =>
                      onStartEdit(reward.id, reward.description || "")
                    }
                    className="text-xs text-[#6B7280] hover:text-[#9CA3AF] mt-1 underline"
                  >
                    {reward.description ? "Edit reward" : "Define reward"}
                  </button>
                )}
              </div>
            )}
          </div>

          {!reward.claimed && !isEditing && (
            <Button
              size="sm"
              onClick={() => onClaim(reward.id, reward.description || "")}
              disabled={!reward.description}
            >
              Claim
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
