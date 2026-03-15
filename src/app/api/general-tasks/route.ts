import { NextRequest, NextResponse } from "next/server";
import {
  getGeneralTasks,
  createGeneralTask,
} from "@/lib/db/queries/general-tasks";

// GET /api/general-tasks
export async function GET() {
  try {
    const tasks = await getGeneralTasks();
    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

// POST /api/general-tasks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, priority, deadline } = body;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const task = await createGeneralTask({ title, priority, deadline });
    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
