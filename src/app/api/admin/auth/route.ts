import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "uon_cod_admin";

function adminPassword() {
  return (process.env.ADMIN_PASSWORD || "admin123").trim();
}

function sign(value: string) {
  return createHmac("sha256", adminPassword()).update(value).digest("hex");
}

function verifyAdminPassword(password: string) {
  const expected = adminPassword();
  const given = String(password || "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function readSession(request: Request) {
  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);

  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length < 3) return false;
  const sig = parts.pop()!;
  const token = parts.join(".");
  const expected = sign(token);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body?.action === "logout") {
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    if (!verifyAdminPassword(String(body?.password || ""))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = `ok.${Date.now()}`;
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, `${token}.${sign(token)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Auth failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: readSession(request) });
}
