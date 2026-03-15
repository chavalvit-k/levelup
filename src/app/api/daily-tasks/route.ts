import { NextRequest, NextResponse } from "next/server";
import {
  getDailyTasksByDate,
  createDailyTask,
} from "@/lib/db/queries/daily-tasks";
import {
  validateTaskDate,
  validateHeroTask,
} from "@/lib/services/task.service";
import { todayString } from "@/lib/services/streak.service";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";

// GET /api/daily-tasks?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date") ?? todayString();
    const tasks = await getDailyTasksByDate(date);
    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

// POST /api/daily-tasks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      date,
      difficulty,
      taskType,
      requiredDuration,
      isHeroTask,
      subtasks,
    } = body;

    if (!title || !date || !difficulty || !taskType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const dateValidation = validateTaskDate(date);
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.reason },
        { status: 400 },
      );
    }

    // Hero task validation
    if (isHeroTask) {
      const existingHero = await prisma.dailyTask.findFirst({
        where: { userId: DEFAULT_USER_ID, date, isHeroTask: true },
      });
      const heroValidation = validateHeroTask(
        { difficulty },
        existingHero?.id ?? null,
        "new",
      );
      if (!heroValidation.valid) {
        return NextResponse.json(
          { error: heroValidation.reason },
          { status: 400 },
        );
      }
    }

    const task = await createDailyTask({
      title,
      date,
      difficulty,
      taskType,
      requiredDuration: requiredDuration ?? undefined,
      isHeroTask: isHeroTask ?? false,
      subtasks: subtasks ?? [],
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
