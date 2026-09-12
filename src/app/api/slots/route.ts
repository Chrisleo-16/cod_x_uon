import { NextResponse } from "next/server";
import { getSlotsStatus } from "@/lib/tournament";

export async function GET() {
  try {
    const status = await getSlotsStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load slots" },
      { status: 500 },
    );
  }
}
