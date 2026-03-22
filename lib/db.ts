import { neon } from "@neondatabase/serverless";

<<<<<<< HEAD
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
=======
export const sql = neon(process.env.DATABASE_URL!);

export async function logEvent(params: {
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
  session_id: string;
  agent_id: string;
  agent_name: string;
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
}) {
<<<<<<< HEAD
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
=======
  const { session_id, agent_id, agent_name, event_type, entity_type, entity_id, payload } = params;
  try {
    await sql`
      INSERT INTO blackboard_events (session_id, agent_id, agent_name, event_type, entity_type, entity_id, payload)
      VALUES (
        ${session_id}::uuid,
        ${agent_id}::uuid,
        ${agent_name},
        ${event_type},
        ${entity_type ?? null},
        ${entity_id ?? null}::uuid,
        ${payload ? JSON.stringify(payload) : null}::jsonb
      )
    `;
  } catch (e) {
    console.error("[logEvent] Failed:", e);
  }
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
}
