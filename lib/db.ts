import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);

// ============================================================
// logEvent helper
// ============================================================
export async function logEvent({
  session_id,
  agent_id,
  agent_name,
  event_type,
  entity_type,
  entity_id,
  payload,
}: {
  session_id: string;
  agent_id: string;
  agent_name: string;
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
}) {
  await sql`
    INSERT INTO blackboard_events (session_id, agent_id, agent_name, event_type, entity_type, entity_id, payload)
    VALUES (
      ${session_id}::uuid,
      ${agent_id}::uuid,
      ${agent_name},
      ${event_type},
      ${entity_type ?? null},
      ${entity_id ? `${entity_id}` : null}::uuid,
      ${payload ? JSON.stringify(payload) : null}::jsonb
    )
  `;
}
