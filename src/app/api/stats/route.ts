import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db/queries/stats";

// GET /api/stats
export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[/api/stats]", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
