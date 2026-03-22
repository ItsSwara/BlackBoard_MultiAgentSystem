import { NextRequest, NextResponse } from "next/server";
import { sql, logEvent } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");

  if (!sessionId) return NextResponse.json({ error: "session_id required" }, { status: 400 });

  const artifactsQuery = type
    ? sql`SELECT * FROM artifacts WHERE session_id = ${sessionId}::uuid AND type = ${type} ORDER BY created_at DESC`
    : sql`SELECT * FROM artifacts WHERE session_id = ${sessionId}::uuid ORDER BY created_at DESC`;

  try {
    const [agents, tasks, artifacts, events] = await Promise.all([
      sql`SELECT * FROM agents WHERE session_id = ${sessionId}::uuid ORDER BY name`,
      sql`SELECT t.*, a.name as posted_by_name FROM tasks t LEFT JOIN agents a ON a.id = t.posted_by WHERE t.session_id = ${sessionId}::uuid ORDER BY t.priority ASC, t.created_at ASC`,
      artifactsQuery,
      sql`SELECT * FROM blackboard_events WHERE session_id = ${sessionId}::uuid ORDER BY created_at ASC LIMIT 100`,
    ]);
    return NextResponse.json({ agents, tasks, artifacts, events });
  } catch {
    // Offline — return empty so UI doesn't crash
    return NextResponse.json({ agents: [], tasks: [], artifacts: [], events: [] });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    const body = await req.json();

    if (action === "upsert-session") {
      const { id, goal, status } = body;
      await sql`
        INSERT INTO sessions (id, goal, status)
        VALUES (${id}::uuid, ${goal}, ${status})
        ON CONFLICT (id) DO UPDATE SET goal = ${goal}, status = ${status}, updated_at = NOW()
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "create-agent") {
      const { session_id, name, type } = body;
      const rows = await sql`
        INSERT INTO agents (session_id, name, type, status)
        VALUES (${session_id}::uuid, ${name}, ${type}, 'idle')
        ON CONFLICT DO NOTHING
        RETURNING id, name
      `;
      return NextResponse.json(rows[0] ?? {});
    }

    if (action === "update-agent") {
      const { id, status } = body;
      await sql`
        UPDATE agents SET status = ${status}, last_seen = NOW() WHERE id = ${id}::uuid
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "update-session") {
      const { id, status } = body;
      if (status === "completed") {
        await sql`
          UPDATE sessions SET status = ${status}, completed_at = NOW(), updated_at = NOW()
          WHERE id = ${id}::uuid
        `;
      } else {
        await sql`
          UPDATE sessions SET status = ${status}, updated_at = NOW()
          WHERE id = ${id}::uuid
        `;
      }
      return NextResponse.json({ success: true });
    }

    if (action === "log-event") {
      const { session_id, agent_id, agent_name, event_type, entity_type, entity_id, payload } = body;
      await logEvent({ session_id, agent_id, agent_name, event_type, entity_type, entity_id, payload });
      return NextResponse.json({ success: true });
    }

    if (action === "create-task") {
      const { session_id, posted_by, title, description, assigned_to, priority, status } = body;
      const [task] = await sql`
        INSERT INTO tasks (session_id, posted_by, title, description, assigned_to, priority, status)
        VALUES (${session_id}::uuid, ${posted_by}::uuid, ${title}, ${description ?? ""}, ${assigned_to}, ${priority ?? 3}, ${status ?? "open"})
        RETURNING id
      `;
      return NextResponse.json({ id: task.id });
    }

    if (action === "create-artifact") {
      const { session_id, task_id, agent_id, agent_name, type, title, content, confidence, status, requires_human_review } = body;

      let artifact;
      if (task_id) {
        [artifact] = await sql`
          INSERT INTO artifacts (session_id, task_id, agent_id, agent_name, type, title, content, confidence, status, requires_human_review)
          VALUES (${session_id}::uuid, ${task_id}::uuid, ${agent_id}::uuid, ${agent_name}, ${type}, ${title}, ${content}, ${confidence}, ${status ?? "pending"}, ${requires_human_review ? 1 : 0})
          RETURNING id
        `;
      } else {
        [artifact] = await sql`
          INSERT INTO artifacts (session_id, agent_id, agent_name, type, title, content, confidence, status, requires_human_review)
          VALUES (${session_id}::uuid, ${agent_id}::uuid, ${agent_name}, ${type}, ${title}, ${content}, ${confidence}, ${status ?? "pending"}, ${requires_human_review ? 1 : 0})
          RETURNING id
        `;
      }
      return NextResponse.json({ id: artifact.id });
    }

    if (action === "update-task") {
      const { id, session_id, assigned_to, status } = body;
      if (id) {
        if (status === "done") {
          await sql`
            UPDATE tasks SET status = ${status}, completed_at = NOW(), updated_at = NOW()
            WHERE id = ${id}::uuid
          `;
        } else {
          await sql`
            UPDATE tasks SET status = ${status}, updated_at = NOW()
            WHERE id = ${id}::uuid
          `;
        }
      } else {
        await sql`
          UPDATE tasks SET status = ${status}, completed_at = NOW(), updated_at = NOW()
          WHERE session_id = ${session_id}::uuid AND assigned_to = ${assigned_to} AND status = 'open'
        `;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (action === "review") {
    const { artifact_id, status, note, session_id } = body as Record<string, string>;
    try {
      await sql`
        UPDATE artifacts SET status = ${status}, human_note = ${note ?? ""}, updated_at = NOW()
        WHERE id = ${artifact_id}::uuid
      `;

      const [humanAgent] = await sql`
        SELECT id FROM agents WHERE session_id = ${session_id}::uuid AND name = 'human'
      `;
      if (humanAgent?.id) {
        await logEvent({
          session_id,
          agent_id: humanAgent.id,
          agent_name: "human",
          event_type: "artifact_reviewed",
          entity_type: "artifact",
          entity_id: artifact_id,
          payload: { status, note },
        });
      }

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("[review] Error:", err);
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  if (action === "post-task") {
    const { session_id, title, assigned_to, priority } = body as Record<string, string>;
    const [humanAgent] = await sql`SELECT id FROM agents WHERE session_id = ${session_id}::uuid AND name = 'human'`;
    const agentId = humanAgent?.id ?? uuidv4();

    const [task] = await sql`
      INSERT INTO tasks (session_id, posted_by, title, assigned_to, priority, status)
      VALUES (${session_id}::uuid, ${agentId}::uuid, ${title}, ${assigned_to ?? null}, ${priority ?? 5}, 'open')
      RETURNING id
    `;
    await logEvent({
      session_id,
      agent_id: agentId,
      agent_name: "human",
      event_type: "task_posted",
      entity_type: "task",
      entity_id: task.id,
      payload: { title, assigned_to },
    });
    return NextResponse.json({ task_id: task.id, success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
