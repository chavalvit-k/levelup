import { prisma } from "@/lib/db/prisma";
import type {
  GeneralTask,
  CreateGeneralTaskInput,
  UpdateGeneralTaskInput,
} from "@/lib/types";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function getGeneralTasks(): Promise<GeneralTask[]> {
  return prisma.generalTask.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  }) as Promise<GeneralTask[]>;
}

export async function createGeneralTask(
  input: CreateGeneralTaskInput,
): Promise<GeneralTask> {
  return prisma.generalTask.create({
    data: {
      userId: DEFAULT_USER_ID,
      title: input.title,
      priority: input.priority ?? "medium",
      deadline: input.deadline ?? null,
    },
  }) as Promise<GeneralTask>;
}

export async function updateGeneralTask(
  id: string,
  input: UpdateGeneralTaskInput,
): Promise<GeneralTask> {
  return prisma.generalTask.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.deadline !== undefined && { deadline: input.deadline }),
      ...(input.done !== undefined && { done: input.done }),
    },
  }) as Promise<GeneralTask>;
}

export async function deleteGeneralTask(id: string): Promise<void> {
  await prisma.generalTask.delete({ where: { id } });
}
