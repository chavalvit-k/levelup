import { NextResponse } from "next/server";
import { getRewards } from "@/lib/db/queries/rewards";

// GET /api/rewards
export async function GET() {
  try {
    const rewards = await getRewards();
    return NextResponse.json({ rewards });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 },
    );
  }
}
