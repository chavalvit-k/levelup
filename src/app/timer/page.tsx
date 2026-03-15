"use client";
import { Suspense } from "react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTimerStore } from "@/store/useTimerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useUserStore } from "@/store/useUserStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDuration, formatDurationLong } from "@/lib/utils";
import { hasReachedRequiredDuration } from "@/lib/services/timer.service";
import { todayString } from "@/lib/services/streak.service";
import { XpGainToast } from "@/components/tasks/XpGainToast";
import type { TaskCompletionResult } from "@/lib/types";

function TimerPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    mode,
    status,
    selectedTaskId,
    selectedTaskRequiredDuration,
    elapsed,
    setMode,
    selectTask,
    clearTask,
    start,
    pause,
    stop,
    tick,
    markCompleted,
  } = useTimerStore();

  const { tasks, fetchTasks, completeTask } = useTaskStore();
  const { fetchUser } = useUserStore();

  const [completionResult, setCompletionResult] =
    useState<TaskCompletionResult | null>(null);
  const autoCompletedRef = useRef(false);

  // Load tasks for today
  useEffect(() => {
    fetchTasks(todayString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle ?taskId= query param from daily page
  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.taskType === "timed") {
        selectTask(task.id, task.requiredDuration);
      }
    }
  }, [searchParams, tasks, selectTask]);

  // Timer tick
  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Auto-complete task when timer reaches required duration
  useEffect(() => {
    if (
      mode === "task" &&
      selectedTaskId &&
      selectedTaskRequiredDuration &&
      status === "running" &&
      !autoCompletedRef.current &&
      hasReachedRequiredDuration(elapsed, selectedTaskRequiredDuration)
    ) {
      autoCompletedRef.current = true;
      markCompleted();
      // Auto-complete the task
      completeTask(selectedTaskId)
        .then((result) => {
          setCompletionResult(result);
          fetchUser();
        })
        .catch(() => {
          // Task might already be completed manually
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, mode, selectedTaskId, selectedTaskRequiredDuration, status]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const pendingTimedTasks = tasks.filter(
    (t) => t.status === "pending" && t.taskType === "timed",
  );

  const progress =
    mode === "task" && selectedTaskRequiredDuration
      ? Math.min(100, (elapsed / selectedTaskRequiredDuration) * 100)
      : 0;

  function handleStop() {
    stop();
    autoCompletedRef.current = false;
    // Save elapsed time to task
    if (selectedTaskId && elapsed > 0) {
      fetch(`/api/daily-tasks/${selectedTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elapsedTime: elapsed }),
      }).catch(() => {});
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#E5E7EB]">Timer</h1>
        <p className="text-[#6B7280] text-sm mt-0.5">Focus on what matters.</p>
      </div>

      {/* Mode selector */}
      {status === "idle" && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("free")}
            className={`flex-1 px-4 py-2.5 text-sm rounded-xl border transition-colors font-medium ${
              mode === "free"
                ? "border-[#6366F1] bg-[#6366F1]/15 text-[#818CF8]"
                : "border-[#1F2937] text-[#6B7280] bg-[#111827] hover:border-[#374151]"
            }`}
          >
            ◷ Free Timer
          </button>
          <button
            onClick={() => setMode("task")}
            className={`flex-1 px-4 py-2.5 text-sm rounded-xl border transition-colors font-medium ${
              mode === "task"
                ? "border-[#6366F1] bg-[#6366F1]/15 text-[#818CF8]"
                : "border-[#1F2937] text-[#6B7280] bg-[#111827] hover:border-[#374151]"
            }`}
          >
            ✓ Task Timer
          </button>
        </div>
      )}

      {/* Task selector */}
      {mode === "task" && status === "idle" && (
        <Card className="mb-6">
          <h3 className="text-sm font-medium text-[#9CA3AF] mb-3">
            Select a timed task
          </h3>
          {pendingTimedTasks.length === 0 ? (
            <p className="text-sm text-[#4B5563] text-center py-4">
              No pending timed tasks for today.{" "}
              <button
                onClick={() => router.push("/daily")}
                className="text-[#6366F1] hover:text-[#818CF8]"
              >
                Create one
              </button>
            </p>
          ) : (
            <div className="space-y-2">
              {pendingTimedTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => selectTask(task.id, task.requiredDuration)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors text-sm ${
                    selectedTaskId === task.id
                      ? "border-[#6366F1] bg-[#6366F1]/10 text-[#E5E7EB]"
                      : "border-[#1F2937] bg-[#0F172A] text-[#9CA3AF] hover:border-[#374151]"
                  }`}
                >
                  <div className="font-medium">{task.title}</div>
                  {task.requiredDuration && (
                    <div className="text-xs text-[#4B5563] mt-0.5">
                      Required: {formatDurationLong(task.requiredDuration)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Timer display */}
      <Card className="mb-6 text-center">
        {mode === "task" && selectedTask && (
          <div className="mb-4">
            <div className="text-xs text-[#6B7280] mb-1">Working on</div>
            <div className="text-sm font-medium text-[#E5E7EB]">
              {selectedTask.title}
            </div>
            {status === "completed" && (
              <div className="mt-2 text-sm text-[#22C55E] font-medium">
                ✓ Task auto-completed!
              </div>
            )}
          </div>
        )}

        {/* Big timer */}
        <div className="text-6xl font-mono font-bold text-[#E5E7EB] tabular-nums py-6">
          {formatDuration(elapsed)}
        </div>

        {/* Progress bar for timed tasks */}
        {mode === "task" && selectedTaskRequiredDuration && (
          <div className="mb-4">
            <div className="bg-[#1F2937] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6366F1] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#4B5563] mt-1">
              <span>{formatDuration(elapsed)}</span>
              <span>{formatDurationLong(selectedTaskRequiredDuration)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {status === "idle" && (
            <Button
              onClick={start}
              disabled={mode === "task" && !selectedTaskId}
              size="lg"
            >
              ▶ Start
            </Button>
          )}
          {status === "running" && (
            <>
              <Button onClick={pause} variant="secondary" size="lg">
                ⏸ Pause
              </Button>
              <Button onClick={handleStop} variant="ghost" size="lg">
                ⏹ Stop
              </Button>
            </>
          )}
          {status === "paused" && (
            <>
              <Button onClick={start} size="lg">
                ▶ Resume
              </Button>
              <Button onClick={handleStop} variant="ghost" size="lg">
                ⏹ Stop
              </Button>
            </>
          )}
          {status === "completed" && (
            <Button
              onClick={() => {
                clearTask();
                autoCompletedRef.current = false;
              }}
              variant="secondary"
              size="lg"
            >
              Done
            </Button>
          )}
        </div>

        {/* Manual complete button */}
        {mode === "task" &&
          selectedTaskId &&
          (status === "running" || status === "paused") && (
            <button
              onClick={async () => {
                try {
                  const result = await completeTask(selectedTaskId);
                  setCompletionResult(result);
                  autoCompletedRef.current = true;
                  markCompleted();
                  fetchUser();
                } catch {
                  // might already be done
                }
              }}
              className="mt-3 text-sm text-[#6B7280] hover:text-[#22C55E] transition-colors"
            >
              Mark as done manually
            </button>
          )}
      </Card>

      {/* Timer history note */}
      {mode === "free" && elapsed > 0 && status === "idle" && (
        <Card>
          <p className="text-sm text-[#6B7280] text-center">
            Last session: {formatDuration(elapsed)} (Free timer — no XP awarded)
          </p>
        </Card>
      )}

      <XpGainToast
        result={completionResult}
        onDismiss={() => setCompletionResult(null)}
      />
    </div>
  );
}

export default function TimerPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-[#6B7280] text-sm">Loading…</div>}
    >
      <TimerPageInner />
    </Suspense>
  );
}
