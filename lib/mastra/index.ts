import { Mastra } from "@mastra/core";
import { orchestratorAgent } from "./agents/orchestrator";
import { researcherAgent, analystAgent, writerAgent } from "./agents/specialists";
import { sql, logEvent } from "../db";
import { v4 as uuidv4 } from "uuid";

export const mastra = new Mastra({
  agents: {
    orchestrator: orchestratorAgent,
    researcher: researcherAgent,
    analyst: analystAgent,
    writer: writerAgent,
  },
});

export interface RunSessionParams {
  goal: string;
  sessionId?: string;
}

export interface RunSessionResult {
  sessionId: string;
  status: "started" | "error";
  message: string;
}

export async function runBlackboardSession(params: RunSessionParams): Promise<RunSessionResult> {
  const { goal } = params;
  const sessionId = params.sessionId ?? uuidv4();

  try {
    await sql`
      INSERT INTO sessions (id, goal, status)
      VALUES (${sessionId}::uuid, ${goal}, 'active')
      ON CONFLICT (id) DO UPDATE SET goal = ${goal}, status = 'active'
    `;

    const agentDefs = [
      { name: "orchestrator", type: "ai" },
      { name: "researcher", type: "ai" },
      { name: "analyst", type: "ai" },
      { name: "writer", type: "ai" },
      { name: "human", type: "human" },
    ];

    const agentIds: Record<string, string> = {};
    for (const def of agentDefs) {
      const [agent] = await sql`
        INSERT INTO agents (session_id, name, type, status)
        VALUES (${sessionId}::uuid, ${def.name}, ${def.type}, 'idle')
        ON CONFLICT DO NOTHING
        RETURNING id
      `;
      if (agent) agentIds[def.name] = agent.id;
    }

    await logEvent({
      session_id: sessionId,
      agent_id: agentIds["orchestrator"] ?? uuidv4(),
      agent_name: "system",
      event_type: "session_started",
      payload: { goal },
    });

    runOrchestratorAsync(sessionId, goal, agentIds);

    return {
      sessionId,
      status: "started",
      message: `Session started. Orchestrator is decomposing the goal.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Mastra] Session error:", error);
    return { sessionId, status: "error", message: msg };
  }
}

async function runOrchestratorAsync(
  sessionId: string,
  goal: string,
  agentIds: Record<string, string>
) {
  try {
    const orchestratorId = agentIds["orchestrator"];
    await sql`UPDATE agents SET status = 'working', last_seen = NOW() WHERE id = ${orchestratorId}::uuid`;

    await orchestratorAgent.generate(`
You are starting a new blackboard session.
Session ID: ${sessionId}
Orchestrator Agent ID: ${orchestratorId}
Goal: ${goal}

Please:
1. Decompose this goal into 3-5 specific subtasks
2. Post each task to the blackboard using post_task, assigning them to appropriate agents (researcher/analyst/writer)
3. Write a brief 'finding' artifact describing your decomposition plan
`);
    await sql`UPDATE agents SET status = 'idle' WHERE id = ${orchestratorId}::uuid`;

    const researcherId = agentIds["researcher"];
    await sql`UPDATE agents SET status = 'working', last_seen = NOW() WHERE id = ${researcherId}::uuid`;
    await researcherAgent.generate(`
You are the Researcher on blackboard session ${sessionId}.
Researcher Agent ID: ${researcherId}
Read the blackboard for open tasks assigned to "researcher" in session ${sessionId}.
Claim each one and write thorough findings.
`);
    await sql`UPDATE agents SET status = 'idle' WHERE id = ${researcherId}::uuid`;

    const analystId = agentIds["analyst"];
    await sql`UPDATE agents SET status = 'working', last_seen = NOW() WHERE id = ${analystId}::uuid`;
    await analystAgent.generate(`
You are the Analyst on blackboard session ${sessionId}.
Analyst Agent ID: ${analystId}
Read the blackboard artifacts of type 'finding' for session ${sessionId}.
Read your assigned tasks and produce analysis artifacts that synthesize the research.
`);
    await sql`UPDATE agents SET status = 'idle' WHERE id = ${analystId}::uuid`;

    const writerId = agentIds["writer"];
    await sql`UPDATE agents SET status = 'working', last_seen = NOW() WHERE id = ${writerId}::uuid`;
    await writerAgent.generate(`
You are the Writer on blackboard session ${sessionId}.
Writer Agent ID: ${writerId}
Read both 'finding' and 'analysis' artifacts for session ${sessionId}.
Produce a final, polished 'final' artifact that fulfills the original goal: "${goal}".
Make it comprehensive, well-structured, and immediately usable.
`);
    await sql`UPDATE agents SET status = 'idle' WHERE id = ${writerId}::uuid`;

    await sql`
      UPDATE sessions
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = ${sessionId}::uuid
    `;

    await logEvent({
      session_id: sessionId,
      agent_id: agentIds["orchestrator"],
      agent_name: "system",
      event_type: "session_completed",
      payload: { goal },
    });
  } catch (error) {
    console.error("[Mastra] Agent run error:", error);
    await sql`UPDATE sessions SET status = 'failed', updated_at = NOW() WHERE id = ${sessionId}::uuid`;
  }
}
