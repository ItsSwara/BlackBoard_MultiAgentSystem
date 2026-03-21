import { NextRequest, NextResponse } from "next/server";
import { sql, logEvent } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action");
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  try {
    if (action === "agents") {
      const agents = await sql`
        SELECT * FROM agents WHERE session_id = ${session_id}::uuid ORDER BY name
      `;
      return NextResponse.json({ agents });
    }

    if (action === "tasks") {
      const tasks = await sql`
        SELECT t.*, a.name as posted_by_name
        FROM tasks t
        LEFT JOIN agents a ON a.id = t.posted_by
        WHERE t.session_id = ${session_id}::uuid
        ORDER BY t.priority ASC, t.created_at ASC
      `;
      return NextResponse.json({ tasks });
    }

    if (action === "artifacts") {
      const artifacts = await sql`
        SELECT * FROM artifacts
        WHERE session_id = ${session_id}::uuid
        ORDER BY created_at DESC
      `;
      return NextResponse.json({ artifacts });
    }

    if (action === "events") {
      const events = await sql`
        SELECT * FROM blackboard_events
        WHERE session_id = ${session_id}::uuid
        ORDER BY created_at ASC
        LIMIT 100
      `;
      return NextResponse.json({ events });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action");

  try {
    const body = await req.json();

    if (action === "review") {
      const { artifact_id, status, note, session_id } = body;
      await sql`
        UPDATE artifacts
        SET status = ${status}, human_note = ${note ?? null}, updated_at = NOW()
        WHERE id = ${artifact_id}::uuid
      `;
      await logEvent({
        session_id,
        agent_id: uuidv4(),
        agent_name: "human",
        event_type: "artifact_reviewed",
        entity_type: "artifact",
        entity_id: artifact_id,
        payload: { status, note },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "post-task") {
      const { session_id, title, assigned_to, priority } = body;

      // Get or create the human agent for this session
      let [humanAgent] = await sql`
        SELECT id FROM agents
        WHERE session_id = ${session_id}::uuid AND name = 'human'
      `;

      if (!humanAgent) {
        [humanAgent] = await sql`
          INSERT INTO agents (session_id, name, type, status)
          VALUES (${session_id}::uuid, 'human', 'human', 'idle')
          RETURNING id
        `;
      }

      const [task] = await sql`
        INSERT INTO tasks (session_id, posted_by, title, assigned_to, priority, status)
        VALUES (${session_id}::uuid, ${humanAgent.id}::uuid, ${title}, ${assigned_to ?? null}, ${priority ?? 5}, 'open')
        RETURNING id
      `;

      await logEvent({
        session_id,
        agent_id: humanAgent.id,
        agent_name: "human",
        event_type: "task_posted",
        entity_type: "task",
        entity_id: task.id,
        payload: { title, assigned_to },
      });

      return NextResponse.json({ task_id: task.id, success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
