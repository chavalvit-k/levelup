import { NextRequest, NextResponse } from "next/server";
import {
  getCosmetics,
  updateCosmetic,
  equipCosmetic,
} from "@/lib/db/queries/cosmetics";

// GET /api/character
export async function GET() {
  try {
    const cosmetics = await getCosmetics();
    return NextResponse.json({ cosmetics });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch cosmetics" },
      { status: 500 },
    );
  }
}

// PATCH /api/character  — equip or update cosmetic color
export async function PATCH(req: NextRequest) {
  try {
    const { id, slot, color, equip } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    if (equip && slot) {
      await equipCosmetic(id, slot);
    }
    if (color) {
      await updateCosmetic(id, { color });
    }

    const cosmetics = await getCosmetics();
    return NextResponse.json({ cosmetics });
  } catch {
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 },
    );
  }
}
