import { NextResponse } from "next/server";
import {
  clearAdminSession,
  setAdminSession,
  verifyAdminPassword,
  isAdminAuthenticated,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json();
  if (body?.action === "logout") {
    await clearAdminSession();
    return NextResponse.json({ ok: true });
  }

  if (!verifyAdminPassword(String(body?.password || ""))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
}
