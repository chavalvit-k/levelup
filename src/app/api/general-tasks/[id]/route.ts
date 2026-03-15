import { NextRequest, NextResponse } from "next/server";
import {
  updateGeneralTask,
  deleteGeneralTask,
} from "@/lib/db/queries/general-tasks";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/general-tasks/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const task = await updateGeneralTask(id, body);
    return NextResponse.json({ task });
  } catch {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

// DELETE /api/general-tasks/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteGeneralTask(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
