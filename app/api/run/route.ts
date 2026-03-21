import { NextRequest, NextResponse } from "next/server";
import { runBlackboardSession } from "@/lib/mastra/index";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { goal, sessionId } = await req.json();
    if (!goal?.trim()) {
      return NextResponse.json({ error: "goal is required" }, { status: 400 });
    }
    const result = await runBlackboardSession({ goal: goal.trim(), sessionId });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }
  try {
    const [session] = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId}::uuid
    `;
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
