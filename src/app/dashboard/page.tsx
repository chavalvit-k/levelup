"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useTaskStore } from "@/store/useTaskStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { XpBar } from "@/components/ui/XpBar";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { SlimeCharacter } from "@/components/character/SlimeCharacter";
import { xpProgressPercent, xpToNextLevel } from "@/lib/services/level.service";
import { todayString } from "@/lib/services/streak.service";
import type { DashboardStats } from "@/lib/db/queries/stats";

// ─── Stat cell ────────────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  color = "#E5E7EB",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xl font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-[11px] text-[#6B7280]">{label}</span>
    </div>
  );
}

// ─── Task stats card with period tabs ─────────────────────────────────────────

function TaskStatsCard({ stats }: { stats: DashboardStats["tasks"] | null }) {
  type Period = "thisWeek" | "thisMonth" | "thisYear" | "allTime";
  const [period, setPeriod] = useState<Period>("thisWeek");

  const TABS: { key: Period; label: string }[] = [
    { key: "thisWeek", label: "Week" },
    { key: "thisMonth", label: "Month" },
    { key: "thisYear", label: "Year" },
    { key: "allTime", label: "All time" },
  ];

  const data = stats?.[period];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#E5E7EB]">Tasks</h2>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                period === tab.key
                  ? "bg-[#6366F1] text-white"
                  : "text-[#6B7280] hover:text-[#9CA3AF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {data ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0F172A] rounded-xl px-4 py-3">
            <StatCell
              label="Completed"
              value={data.completed}
              color="#22C55E"
            />
          </div>
          <div className="bg-[#0F172A] rounded-xl px-4 py-3">
            <StatCell label="Missed" value={data.missed} color="#EF4444" />
          </div>
          <div className="col-span-2 bg-[#0F172A] rounded-xl px-4 py-3">
            <StatCell
              label="Completion rate"
              value={
                data.completed + data.missed > 0
                  ? `${Math.round((data.completed / (data.completed + data.missed)) * 100)}%`
                  : "—"
              }
              color="#6366F1"
            />
          </div>
        </div>
      ) : (
        <div className="text-[#4B5563] text-sm">Loading…</div>
      )}
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, fetchUser } = useUserStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchTasks(todayString());
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .finally(() => setStatsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = todayString();

  const todayStats = useMemo(() => {
    const todayTasks = tasks.filter((t) => t.date === today);
    const done = todayTasks.filter((t) => t.status === "done");
    const failed = todayTasks.filter((t) => t.status === "failed");
    const pending = todayTasks.filter((t) => t.status === "pending");
    const xpEarned = done.reduce((sum, t) => sum + t.xpEarned, 0);
    const heroTask = todayTasks.find((t) => t.isHeroTask);
    return { todayTasks, done, failed, pending, xpEarned, heroTask };
  }, [tasks, today]);

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <span className="text-[#6B7280] text-sm animate-pulse">Loading…</span>
      </div>
    );
  }

  const percent = xpProgressPercent(user.totalXp);
  const toNext = xpToNextLevel(user.totalXp);
  const allDone =
    todayStats.todayTasks.length > 0 &&
    todayStats.pending.length === 0 &&
    todayStats.failed.length === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#E5E7EB] tracking-tight">
          Dashboard
        </h1>
        <p className="text-[#4B5563] text-xs mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* ── Primary row: Character · Progress · Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_1fr] gap-4 mb-4">
        {/* Character panel */}
        <Card className="flex flex-col items-center py-5 gap-3">
          <SlimeCharacter color={user.characterColor} scale={1} />
          <div className="text-center w-full px-2">
            <div className="text-sm font-bold text-[#E5E7EB]">
              Level {user.level}
            </div>
            <div className="mt-1.5">
              <XpBar percent={percent} />
            </div>
            <div className="flex justify-between text-[10px] text-[#4B5563] mt-1">
              <span>{user.xp} XP</span>
              <span>{toNext} to next</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className="text-base">🔥</span>
              <span className="text-lg font-bold text-[#FB923C] leading-none">
                {user.streak}
              </span>
              <span className="text-xs text-[#6B7280]">day streak</span>
            </div>
            {user.longestStreak > 0 && (
              <div className="text-[10px] text-[#4B5563] mt-0.5">
                Best: {user.longestStreak} days
              </div>
            )}
          </div>
        </Card>

        {/* Today's tasks */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#E5E7EB]">
              Today&apos;s Tasks
            </h2>
            {allDone && <Badge color="success">All done! 🎉</Badge>}
          </div>

          {todayStats.todayTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#4B5563]">No tasks today.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="bg-[#1F2937] rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#22C55E]"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        todayStats.todayTasks.length > 0
                          ? (todayStats.done.length /
                              todayStats.todayTasks.length) *
                            100
                          : 0
                      }%`,
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#4B5563] mt-1.5">
                  <span>
                    {todayStats.done.length} / {todayStats.todayTasks.length}{" "}
                    complete
                  </span>
                  {todayStats.failed.length > 0 && (
                    <span className="text-[#EF4444]">
                      {todayStats.failed.length} failed
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-[#0F172A] rounded-xl py-3">
                  <div className="text-lg font-bold text-[#22C55E]">
                    {todayStats.done.length}
                  </div>
                  <div className="text-xs text-[#4B5563]">Done</div>
                </div>
                <div className="bg-[#0F172A] rounded-xl py-3">
                  <div className="text-lg font-bold text-[#6B7280]">
                    {todayStats.pending.length}
                  </div>
                  <div className="text-xs text-[#4B5563]">Pending</div>
                </div>
                <div className="bg-[#0F172A] rounded-xl py-3">
                  <div className="text-lg font-bold text-[#F59E0B]">
                    {todayStats.xpEarned}
                  </div>
                  <div className="text-xs text-[#4B5563]">XP</div>
                </div>
              </div>

              {todayStats.heroTask && (
                <div className="px-3 py-2.5 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 flex items-center gap-3">
                  <span className="text-lg">⭐</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-[#F59E0B] font-semibold uppercase tracking-wide">
                      Hero Task
                    </div>
                    <div
                      className={`text-sm truncate ${
                        todayStats.heroTask.status === "done"
                          ? "text-[#4B5563] line-through"
                          : "text-[#E5E7EB]"
                      }`}
                    >
                      {todayStats.heroTask.title}
                    </div>
                  </div>
                  {todayStats.heroTask.status === "done" && (
                    <Badge color="success">Done</Badge>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {/* All-time + period stats */}
        <div className="flex flex-col gap-3">
          {/* All-time numbers */}
          <Card>
            <div className="text-[10px] text-[#6B7280] mb-2 font-semibold uppercase tracking-wider">
              All time
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCell
                label="XP earned"
                value={user.totalXp}
                color="#F59E0B"
              />
              <StatCell
                label="Tasks done"
                value={stats?.tasks.allTime.completed ?? "—"}
                color="#22C55E"
              />
              <StatCell
                label="Completion %"
                value={stats ? `${stats.completionRate}%` : "—"}
                color="#6366F1"
              />
              <StatCell
                label="Avg / day"
                value={stats?.avgTasksPerDay ?? "—"}
                color="#E5E7EB"
              />
            </div>
          </Card>

          {/* Task stats by period */}
          <TaskStatsCard stats={stats?.tasks ?? null} />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="py-3 px-4">
          <StatCell
            label="Rewards unlocked"
            value={stats?.rewards.totalUnlocked ?? "—"}
            color="#F59E0B"
          />
        </Card>
        <Card className="py-3 px-4">
          <StatCell
            label="Rewards claimed"
            value={stats?.rewards.totalClaimed ?? "—"}
            color="#22C55E"
          />
        </Card>
        <Card className="py-3 px-4">
          <StatCell
            label="Best streak"
            value={user.longestStreak > 0 ? `${user.longestStreak}d` : "—"}
            color="#FB923C"
          />
        </Card>
        <Card className="py-3 px-4">
          <StatCell
            label="Missed (all time)"
            value={stats?.tasks.allTime.missed ?? "—"}
            color="#EF4444"
          />
        </Card>
      </div>

      {/* ── Activity heatmap ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#E5E7EB]">
            Activity — last 12 months
          </h2>
          {stats && (
            <span className="text-xs text-[#6B7280]">
              {stats.tasks.allTime.completed} total completions
            </span>
          )}
        </div>
        {statsLoading ? (
          <div className="h-28 flex items-center justify-center">
            <span className="text-[#4B5563] text-sm animate-pulse">
              Loading…
            </span>
          </div>
        ) : (
          <ActivityHeatmap data={stats?.heatmap ?? []} />
        )}
      </Card>
    </div>
  );
}
