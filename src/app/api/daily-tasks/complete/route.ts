import { NextRequest, NextResponse } from "next/server";
import { completeTask } from "@/lib/services/completion.service";

// POST /api/daily-tasks/complete
export async function POST(req: NextRequest) {
  try {
    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 },
      );
    }
    const result = await completeTask(taskId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to complete task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
