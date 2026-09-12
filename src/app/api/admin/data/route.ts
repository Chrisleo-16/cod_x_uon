import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { generatePoolMatches, getAdminData, upsertMatchScore } from "@/lib/tournament";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getAdminData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (body?.action === "generate_pool_matches") {
    const created = await generatePoolMatches();
    return NextResponse.json({ created });
  }

  if (body?.action === "upsert_match") {
    const row = await upsertMatchScore(body.match);
    return NextResponse.json({ match: row });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
