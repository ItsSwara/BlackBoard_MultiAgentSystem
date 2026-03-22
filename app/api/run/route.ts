import { NextRequest, NextResponse } from "next/server";
import { runBlackboardSession } from "@/lib/mastra/index";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
<<<<<<< HEAD
  const { goal, sessionId } = await req.json();
  if (!goal) return NextResponse.json({ error: "goal is required" }, { status: 400 });

  const result = await runBlackboardSession({ goal, sessionId });
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const [session] = await sql`SELECT * FROM sessions WHERE id = ${sessionId}::uuid`;
  return NextResponse.json({ session });
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
}
