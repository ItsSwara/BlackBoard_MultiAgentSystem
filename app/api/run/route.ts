import { NextRequest, NextResponse } from "next/server";
import { runBlackboardSession } from "@/lib/mastra/index";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
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
}
