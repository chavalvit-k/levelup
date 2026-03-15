import { prisma, ensureDefaultUser } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  DailyTask,
  Difficulty,
  TaskType,
  TaskStatus,
  CreateDailyTaskInput,
  UpdateDailyTaskInput,
} from "@/lib/types";
import { DEFAULT_USER_ID } from "@/lib/constants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type RawTask = Prisma.DailyTaskGetPayload<{ include: { subtasks: true } }>;

function mapTask(raw: RawTask): DailyTask {
  return {
    ...raw,
    difficulty: raw.difficulty as Difficulty,
    taskType: raw.taskType as TaskType,
    status: raw.status as TaskStatus,
    subtasks: raw.subtasks ?? [],
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getDailyTasksByDate(date: string): Promise<DailyTask[]> {
  const tasks = await prisma.dailyTask.findMany({
    where: { userId: DEFAULT_USER_ID, date },
    include: { subtasks: true },
    orderBy: { createdAt: "asc" },
  });
  return tasks.map(mapTask);
}

export async function getDailyTaskById(id: string): Promise<DailyTask | null> {
  const task = await prisma.dailyTask.findUnique({
    where: { id },
    include: { subtasks: true },
  });
  return task ? mapTask(task) : null;
}

export async function createDailyTask(
  input: CreateDailyTaskInput,
): Promise<DailyTask> {
  await ensureDefaultUser();
  const task = await prisma.dailyTask.create({
    data: {
      userId: DEFAULT_USER_ID,
      title: input.title,
      date: input.date,
      difficulty: input.difficulty,
      taskType: input.taskType,
      requiredDuration: input.requiredDuration ?? null,
      isHeroTask: input.isHeroTask ?? false,
      subtasks: input.subtasks?.length
        ? {
            create: input.subtasks.map((s) => ({ title: s.title })),
          }
        : undefined,
    },
    include: { subtasks: true },
  });
  return mapTask(task);
}

export async function updateDailyTask(
  id: string,
  input: UpdateDailyTaskInput,
): Promise<DailyTask> {
  const task = await prisma.dailyTask.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
      ...(input.taskType !== undefined && { taskType: input.taskType }),
      ...(input.requiredDuration !== undefined && {
        requiredDuration: input.requiredDuration,
      }),
      ...(input.isHeroTask !== undefined && { isHeroTask: input.isHeroTask }),
    },
    include: { subtasks: true },
  });
  return mapTask(task);
}

export async function deleteDailyTask(id: string): Promise<void> {
  await prisma.dailyTask.delete({ where: { id } });
}

export async function markTaskFailed(id: string): Promise<DailyTask> {
  const task = await prisma.dailyTask.update({
    where: { id },
    data: { status: "failed" },
    include: { subtasks: true },
  });
  return mapTask(task);
}

export async function updateSubtaskDone(subtaskId: string, done: boolean) {
  return prisma.subtask.update({
    where: { id: subtaskId },
    data: { done },
  });
}

export async function addSubtask(dailyTaskId: string, title: string) {
  return prisma.subtask.create({
    data: { dailyTaskId, title },
  });
}

export async function deleteSubtask(subtaskId: string) {
  return prisma.subtask.delete({ where: { id: subtaskId } });
}

export async function updateTaskElapsedTime(
  taskId: string,
  elapsedTime: number,
): Promise<void> {
  await prisma.dailyTask.update({
    where: { id: taskId },
    data: { elapsedTime },
  });
}
