import { NextResponse } from "next/server";
import { registerTeam } from "@/lib/tournament";
import type { TeamRegistrationPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TeamRegistrationPayload;
    const result = await registerTeam(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    if (message === "REGISTRATION_FULL") {
      return NextResponse.json(
        { error: message, code: "REGISTRATION_FULL" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
