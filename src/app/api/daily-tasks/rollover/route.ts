import { NextResponse } from "next/server";
import { rolloverFailedTasks } from "@/lib/services/completion.service";

// POST /api/daily-tasks/rollover
// Called on app startup to fail any pending tasks from previous days.
export async function POST() {
  try {
    const count = await rolloverFailedTasks();
    return NextResponse.json({ failedCount: count });
  } catch {
    return NextResponse.json({ error: "Rollover failed" }, { status: 500 });
  }
}
