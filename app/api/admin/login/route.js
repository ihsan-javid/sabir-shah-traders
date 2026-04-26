import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const validUser = username === process.env.ADMIN_USERNAME;
    const validPass = password === process.env.ADMIN_PASSWORD;

    if (!validUser || !validPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ username, role: "admin" });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
