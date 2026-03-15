"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DailyTask } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDurationLong } from "@/lib/utils";
import { DIFFICULTY_XP } from "@/lib/constants";

interface TaskCardProps {
  task: DailyTask;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  onEdit: (task: DailyTask) => void;
  onToggleSubtask: (subtaskId: string, done: boolean) => Promise<void>;
  onSelectForTimer?: (task: DailyTask) => void;
}

const difficultyColor: Record<
  string,
  "default" | "success" | "xp" | "streak" | "failure"
> = {
  trivial: "default",
  standard: "success",
  challenging: "xp",
  heroic: "streak",
};

const difficultyLabel: Record<string, string> = {
  trivial: "Trivial",
  standard: "Standard",
  challenging: "Challenging",
  heroic: "Heroic",
};

export function TaskCard({
  task,
  onComplete,
  onDelete,
  onEdit,
  onToggleSubtask,
  onSelectForTimer,
}: TaskCardProps) {
  const [completing, setCompleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isDone = task.status === "done";
  const isFailed = task.status === "failed";

  async function handleComplete() {
    if (isDone || isFailed || completing) return;
    setCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setCompleting(false);
    }
  }

  const xpForDifficulty =
    DIFFICULTY_XP[task.difficulty as keyof typeof DIFFICULTY_XP];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "border rounded-xl p-4 transition-colors",
        isDone
          ? "border-[#22C55E]/30 bg-[#22C55E]/5"
          : isFailed
            ? "border-[#EF4444]/30 bg-[#EF4444]/5"
            : "border-[#1F2937] bg-[#111827]",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={handleComplete}
          disabled={isDone || isFailed || completing}
          className={cn(
            "w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
            isDone
              ? "bg-[#22C55E] border-[#22C55E]"
              : isFailed
                ? "border-[#EF4444] cursor-not-allowed"
                : "border-[#374151] hover:border-[#6366F1] cursor-pointer",
          )}
          aria-label={isDone ? "Completed" : "Mark complete"}
        >
          {isDone && <span className="text-white text-xs">✓</span>}
          {isFailed && <span className="text-[#EF4444] text-xs">✗</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-sm font-medium",
                isDone
                  ? "line-through text-[#6B7280]"
                  : isFailed
                    ? "line-through text-[#EF4444]/70"
                    : "text-[#E5E7EB]",
              )}
            >
              {task.title}
            </span>

            {task.isHeroTask && <Badge color="xp">⚡ Hero</Badge>}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge color={difficultyColor[task.difficulty]}>
              {difficultyLabel[task.difficulty]} +{xpForDifficulty}XP
            </Badge>

            {task.taskType === "timed" && task.requiredDuration && (
              <Badge color="primary">
                ◷ {formatDurationLong(task.requiredDuration)}
              </Badge>
            )}

            {isDone && task.xpEarned > 0 && (
              <Badge color="xp">+{task.xpEarned} XP earned</Badge>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
              >
                {task.subtasks.filter((s) => s.done).length}/
                {task.subtasks.length} subtasks {expanded ? "▲" : "▼"}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1.5 pl-2 border-l border-[#1F2937]">
                      {task.subtasks.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={sub.done}
                            onChange={(e) =>
                              onToggleSubtask(sub.id, e.target.checked)
                            }
                            disabled={isDone || isFailed}
                            className="w-3.5 h-3.5 rounded accent-[#6366F1]"
                          />
                          <span
                            className={cn(
                              "text-xs",
                              sub.done
                                ? "line-through text-[#4B5563]"
                                : "text-[#9CA3AF]",
                            )}
                          >
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isDone && !isFailed && (
          <div className="flex items-center gap-1 shrink-0">
            {task.taskType === "timed" && onSelectForTimer && (
              <button
                onClick={() => onSelectForTimer(task)}
                title="Start timer for this task"
                className="p-1.5 text-[#6B7280] hover:text-[#6366F1] transition-colors"
              >
                ◷
              </button>
            )}
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-[#6B7280] hover:text-[#E5E7EB] transition-colors"
              title="Edit"
            >
              ✎
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-[#6B7280] hover:text-[#EF4444] transition-colors"
              title="Delete"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
