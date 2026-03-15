"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGeneralTaskStore } from "@/store/useGeneralTaskStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn, formatDate } from "@/lib/utils";
import { PRIORITIES } from "@/lib/constants";
import type { GeneralTask, Priority } from "@/lib/types";

const priorityColor: Record<
  Priority,
  "default" | "primary" | "xp" | "failure"
> = {
  low: "default",
  medium: "primary",
  high: "xp",
  urgent: "failure",
};

function GeneralTaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: GeneralTask;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className={cn(
        "flex items-start gap-3 p-3 border rounded-xl transition-colors",
        task.done
          ? "border-[#1F2937] bg-transparent opacity-50"
          : "border-[#1F2937] bg-[#111827]",
      )}
    >
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded accent-[#6366F1]"
      />
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-medium",
            task.done ? "line-through text-[#4B5563]" : "text-[#E5E7EB]",
          )}
        >
          {task.title}
        </span>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge color={priorityColor[task.priority as Priority]}>
            {task.priority}
          </Badge>
          {task.deadline && (
            <span className="text-xs text-[#6B7280]">
              Due {formatDate(task.deadline)}
            </span>
          )}
        </div>
      </div>
      {!task.done && (
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-[#6B7280] hover:text-[#E5E7EB] transition-colors text-sm"
          >
            ✎
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-[#6B7280] hover:text-[#EF4444] transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </motion.div>
  );
}

function TaskFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    priority: Priority;
    deadline?: string;
  }) => Promise<void>;
  initial?: GeneralTask | null;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [priority, setPriority] = useState<Priority>(
    initial?.priority ?? "medium",
  );
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setPriority(initial?.priority ?? "medium");
      setDeadline(initial?.deadline ?? "");
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        priority,
        deadline: deadline || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Task" : "New General Task"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] placeholder-[#4B5563] focus:outline-none focus:border-[#6366F1]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Priority
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                  priority === p
                    ? "border-[#6366F1] bg-[#6366F1]/20 text-[#818CF8]"
                    : "border-[#1F2937] text-[#6B7280] hover:border-[#374151]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Deadline (optional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#6366F1]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !title.trim()}
            className="flex-1"
          >
            {submitting ? "Saving..." : initial ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function GeneralPage() {
  const {
    tasks,
    isLoading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleDone,
  } = useGeneralTaskStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GeneralTask | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "done">("active");

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeCounts = tasks.filter((t) => !t.done).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E5E7EB]">General Tasks</h1>
          <p className="text-[#6B7280] text-sm mt-0.5">
            {activeCounts} active task{activeCounts !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ New Task</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-[#111827] border border-[#1F2937] rounded-lg p-1 w-fit">
        {(["active", "done", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 text-sm rounded-md capitalize transition-colors",
              filter === f
                ? "bg-[#6366F1] text-white"
                : "text-[#6B7280] hover:text-[#E5E7EB]",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-[#4B5563] py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#4B5563] mb-3">
            {filter === "active" ? "No active tasks." : "No tasks here."}
          </p>
          {filter !== "done" && (
            <Button variant="secondary" onClick={() => setShowForm(true)}>
              Add a task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((task) => (
              <GeneralTaskItem
                key={task.id}
                task={task}
                onToggle={(done) => toggleDone(task.id, done)}
                onDelete={() => deleteTask(task.id)}
                onEdit={() => setEditing(task)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskFormModal
        open={showForm || editing !== null}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSubmit={async (data) => {
          if (editing) {
            await updateTask(editing.id, data);
            setEditing(null);
          } else {
            await createTask(data);
          }
        }}
        initial={editing}
      />
    </div>
  );
}
