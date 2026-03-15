"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useTaskStore } from "@/store/useTaskStore";
import { useUserStore } from "@/store/useUserStore";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { XpGainToast } from "@/components/tasks/XpGainToast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { XpBar } from "@/components/ui/XpBar";
import { formatDate } from "@/lib/utils";
import { todayString } from "@/lib/services/streak.service";
import { xpProgressPercent, xpToNextLevel } from "@/lib/services/level.service";
import type { DailyTask } from "@/lib/types";

export default function DailyPage() {
  const router = useRouter();
  const {
    tasks,
    selectedDate,
    isLoading,
    fetchTasks,
    setSelectedDate,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    toggleSubtask,
    rolloverFailed,
    lastCompletionResult,
    clearCompletionResult,
  } = useTaskStore();
  const { user, fetchUser } = useUserStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  useEffect(() => {
    rolloverFailed().then(() => {
      fetchTasks();
      fetchUser();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDateChange(direction: -1 | 1) {
    const current = new Date(selectedDate + "T12:00:00");
    current.setDate(current.getDate() + direction);
    const newDate = current.toISOString().split("T")[0];
    setSelectedDate(newDate);
  }

  const isToday = selectedDate === todayString();
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;
  const heroTask = tasks.find((t) => t.isHeroTask);
  const existingHeroId = heroTask?.id ?? null;

  const xpPercent = user ? xpProgressPercent(user.totalXp) : 0;
  const xpNeeded = user ? xpToNextLevel(user.totalXp) : 500;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E5E7EB]">Daily Tasks</h1>
          <p className="text-[#6B7280] text-sm mt-0.5">
            {isToday ? "Today" : formatDate(selectedDate)}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="md">
          + New Task
        </Button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => handleDateChange(-1)}
          className="p-2 text-[#6B7280] hover:text-[#E5E7EB] hover:bg-[#1F2937] rounded-lg transition-colors"
        >
          ←
        </button>
        <span className="text-sm font-medium text-[#E5E7EB] min-w-30 text-center">
          {isToday ? "Today" : formatDate(selectedDate)}
        </span>
        <button
          onClick={() => handleDateChange(1)}
          className="p-2 text-[#6B7280] hover:text-[#E5E7EB] hover:bg-[#1F2937] rounded-lg transition-colors"
        >
          →
        </button>
        {!isToday && (
          <button
            onClick={() => setSelectedDate(todayString())}
            className="text-xs text-[#6366F1] hover:text-[#818CF8] ml-2 transition-colors"
          >
            Back to Today
          </button>
        )}
      </div>

      {/* Stats + XP bar */}
      {user && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#E5E7EB]">
                  {doneCount}
                </div>
                <div className="text-xs text-[#22C55E]">Done</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#E5E7EB]">
                  {pendingCount}
                </div>
                <div className="text-xs text-[#6B7280]">Pending</div>
              </div>
              {failedCount > 0 && (
                <div className="text-center">
                  <div className="text-lg font-bold text-[#EF4444]">
                    {failedCount}
                  </div>
                  <div className="text-xs text-[#EF4444]">Failed</div>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-[#E5E7EB]">
                Level {user.level}
              </div>
              <div className="text-xs text-[#6B7280]">
                {xpNeeded} XP to next
              </div>
            </div>
          </div>
          <XpBar percent={xpPercent} color="#6366F1" height={6} />
        </Card>
      )}

      {/* Hero task highlight */}
      {heroTask &&
        heroTask.status !== "done" &&
        heroTask.status !== "failed" && (
          <Card className="mb-4 border-[#F59E0B]/30 bg-[#F59E0B]/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#F59E0B]">⚡</span>
              <span className="text-xs font-semibold text-[#FCD34D]">
                Hero Task
              </span>
            </div>
            <p className="text-sm text-[#E5E7EB]">{heroTask.title}</p>
          </Card>
        )}

      {/* Task list */}
      {isLoading ? (
        <div className="text-center text-[#4B5563] py-12">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#4B5563] mb-3">No tasks for this day.</p>
          <Button onClick={() => setShowForm(true)} variant="secondary">
            Create your first task
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={async (id) => {
                  await completeTask(id);
                }}
                onDelete={deleteTask}
                onEdit={setEditingTask}
                onToggleSubtask={toggleSubtask}
                onSelectForTimer={(t) => {
                  router.push(`/timer?taskId=${t.id}`);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Task form modal */}
      <TaskForm
        open={showForm || editingTask !== null}
        onClose={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
        onSubmit={async (data) => {
          if (editingTask) {
            await updateTask(editingTask.id, {
              title: data.title,
              date: data.date,
              difficulty: data.difficulty,
              taskType: data.taskType,
              requiredDuration: data.requiredDuration,
              isHeroTask: data.isHeroTask,
            });
            setEditingTask(null);
          } else {
            await createTask(data);
          }
        }}
        initialData={editingTask ?? undefined}
        existingHeroTaskId={existingHeroId}
      />

      {/* XP gain toast */}
      <XpGainToast
        result={lastCompletionResult}
        onDismiss={() => {
          clearCompletionResult();
          fetchUser();
        }}
      />
    </div>
  );
}
