import { NextRequest, NextResponse } from "next/server";
import { updateSubtaskDone, deleteSubtask } from "@/lib/db/queries/daily-tasks";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/subtasks/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { done } = await req.json();
    const subtask = await updateSubtaskDone(id, done);
    return NextResponse.json({ subtask });
  } catch {
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 },
    );
  }
}

// DELETE /api/subtasks/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteSubtask(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete subtask" },
      { status: 500 },
    );
  }
}
