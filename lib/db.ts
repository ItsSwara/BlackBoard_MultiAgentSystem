import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export async function logEvent(params: {
  session_id: string;
  agent_id: string;
  agent_name: string;
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
}) {
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
}
