import { NextRequest, NextResponse } from "next/server";
import { updateReward, deleteReward } from "@/lib/db/queries/rewards";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/rewards/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const reward = await updateReward(id, body);
    return NextResponse.json({ reward });
  } catch {
    return NextResponse.json(
      { error: "Failed to update reward" },
      { status: 500 },
    );
  }
}

// DELETE /api/rewards/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteReward(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete reward" },
      { status: 500 },
    );
  }
}
