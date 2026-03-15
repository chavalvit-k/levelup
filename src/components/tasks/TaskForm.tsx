"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DIFFICULTIES, TASK_TYPES } from "@/lib/constants";
import type { DailyTask, Difficulty, TaskType } from "@/lib/types";
import { todayString } from "@/lib/services/streak.service";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    date: string;
    difficulty: Difficulty;
    taskType: TaskType;
    requiredDuration?: number;
    isHeroTask: boolean;
    subtasks: { title: string }[];
  }) => Promise<void>;
  initialData?: Partial<DailyTask>;
  existingHeroTaskId?: string | null;
}

const difficultyLabels: Record<Difficulty, string> = {
  trivial: "Trivial (+5 XP)",
  standard: "Standard (+10 XP)",
  challenging: "Challenging (+15 XP)",
  heroic: "Heroic (+20 XP)",
};

export function TaskForm({
  open,
  onClose,
  onSubmit,
  initialData,
  existingHeroTaskId,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [date, setDate] = useState(initialData?.date ?? todayString());
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialData?.difficulty ?? "standard",
  );
  const [taskType, setTaskType] = useState<TaskType>(
    initialData?.taskType ?? "non_timed",
  );
  const [durationHours, setDurationHours] = useState(
    initialData?.requiredDuration
      ? Math.floor(initialData.requiredDuration / 3600)
      : 0,
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.requiredDuration
      ? Math.floor((initialData.requiredDuration % 3600) / 60)
      : 0,
  );
  const [isHeroTask, setIsHeroTask] = useState(
    initialData?.isHeroTask ?? false,
  );
  const [subtasks, setSubtasks] = useState<string[]>(
    initialData?.subtasks?.map((s) => s.title) ?? [],
  );
  const [newSubtask, setNewSubtask] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canBeHero =
    difficulty === "standard" ||
    difficulty === "challenging" ||
    difficulty === "heroic";

  const heroBlocked =
    existingHeroTaskId != null && existingHeroTaskId !== initialData?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const requiredDuration =
      taskType === "timed"
        ? durationHours * 3600 + durationMinutes * 60
        : undefined;

    if (taskType === "timed" && (!requiredDuration || requiredDuration <= 0)) {
      setError("Please enter a duration for the timed task.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        date,
        difficulty,
        taskType,
        requiredDuration,
        isHeroTask: isHeroTask && canBeHero && !heroBlocked,
        subtasks: subtasks
          .filter((s) => s.trim())
          .map((s) => ({ title: s.trim() })),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  function addSubtask() {
    if (newSubtask.trim() && subtasks.length < 10) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask("");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Task" : "New Daily Task"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Task Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to accomplish?"
            className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] placeholder-[#4B5563] focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            min={todayString()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Difficulty
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDifficulty(d);
                  if (isHeroTask && d === "trivial") {
                    setIsHeroTask(false);
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors text-left ${
                  difficulty === d
                    ? "border-[#6366F1] bg-[#6366F1]/20 text-[#818CF8]"
                    : "border-[#1F2937] text-[#6B7280] hover:border-[#374151]"
                }`}
              >
                {difficultyLabels[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Task Type */}
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Task Type
          </label>
          <div className="flex gap-2">
            {TASK_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTaskType(t)}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  taskType === t
                    ? "border-[#6366F1] bg-[#6366F1]/20 text-[#818CF8]"
                    : "border-[#1F2937] text-[#6B7280] hover:border-[#374151]"
                }`}
              >
                {t === "timed" ? "⏱ Timed" : "✓ Non-Timed"}
              </button>
            ))}
          </div>
        </div>

        {/* Duration (timed only) */}
        {taskType === "timed" && (
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Required Duration
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                max={23}
                value={durationHours}
                onChange={(e) =>
                  setDurationHours(parseInt(e.target.value) || 0)
                }
                className="w-20 bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#6366F1]"
              />
              <span className="text-[#6B7280] text-xs">h</span>
              <input
                type="number"
                min={0}
                max={59}
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(parseInt(e.target.value) || 0)
                }
                className="w-20 bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#6366F1]"
              />
              <span className="text-[#6B7280] text-xs">m</span>
            </div>
          </div>
        )}

        {/* Hero task */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!canBeHero || heroBlocked) return;
              setIsHeroTask(!isHeroTask);
            }}
            disabled={!canBeHero || heroBlocked}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              isHeroTask && canBeHero
                ? "bg-[#F59E0B] border-[#F59E0B]"
                : "border-[#374151]"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isHeroTask && canBeHero && (
              <span className="text-white text-xs">✓</span>
            )}
          </button>
          <div>
            <span className="text-sm text-[#E5E7EB]">
              ⚡ Hero Task (+10 XP bonus)
            </span>
            {!canBeHero && (
              <p className="text-xs text-[#6B7280]">
                Requires Standard difficulty or higher
              </p>
            )}
            {heroBlocked && canBeHero && (
              <p className="text-xs text-[#EF4444]">
                Another hero task already exists for this day
              </p>
            )}
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Subtasks (optional, max 10)
          </label>
          <div className="space-y-1.5 mb-2">
            {subtasks.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-xs text-[#9CA3AF] bg-[#0F172A] border border-[#1F2937] rounded px-2 py-1">
                  {s}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSubtasks(subtasks.filter((_, j) => j !== i))
                  }
                  className="text-[#6B7280] hover:text-[#EF4444] text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {subtasks.length < 10 && (
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add subtask..."
                className="flex-1 bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-1.5 text-xs text-[#E5E7EB] placeholder-[#4B5563] focus:outline-none focus:border-[#6366F1]"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-3 py-1.5 text-xs bg-[#1F2937] text-[#9CA3AF] hover:text-[#E5E7EB] rounded-lg transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting
              ? "Saving..."
              : initialData
                ? "Save Changes"
                : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
