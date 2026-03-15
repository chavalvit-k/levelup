import { NextRequest, NextResponse } from "next/server";
import {
  getDailyTaskById,
  updateDailyTask,
  deleteDailyTask,
} from "@/lib/db/queries/daily-tasks";
import { validateHeroTask } from "@/lib/services/task.service";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

// GET /api/daily-tasks/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const task = await getDailyTaskById(id);
    if (!task)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ task });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 },
    );
  }
}

// PATCH /api/daily-tasks/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Hero task validation
    if (body.isHeroTask === true) {
      const existing = await getDailyTaskById(id);
      if (!existing)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      const existingHero = await prisma.dailyTask.findFirst({
        where: {
          userId: DEFAULT_USER_ID,
          date: existing.date,
          isHeroTask: true,
        },
      });
      const validation = validateHeroTask(
        { difficulty: body.difficulty ?? existing.difficulty },
        existingHero?.id ?? null,
        id,
      );
      if (!validation.valid) {
        return NextResponse.json({ error: validation.reason }, { status: 400 });
      }
    }

    const task = await updateDailyTask(id, body);
    return NextResponse.json({ task });
  } catch {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

// DELETE /api/daily-tasks/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteDailyTask(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
