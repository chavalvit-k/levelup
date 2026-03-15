import { NextRequest, NextResponse } from "next/server";
import { getUser, updateUser } from "@/lib/db/queries/user";

// GET /api/user
export async function GET() {
  try {
    const user = await getUser();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PATCH /api/user
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await updateUser(body);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
