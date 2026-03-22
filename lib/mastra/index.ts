<<<<<<< HEAD
import Groq from "groq-sdk";
import { v4 as uuidv4 } from "uuid";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BASE_URL = process.env.APP_URL ?? "http://localhost:3000";

async function apiWrite(
  action: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${BASE_URL}/api/blackboard?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    console.warn(`[DB] Offline — queued write skipped: ${action}`);
    return {};
  }
}

interface Task {
  title: string;
  assigned_to: string;
  description: string;
  id?: string;
}

interface Finding {
  title: string;
  content: string;
  confidence: number;
}

interface Analysis {
  title: string;
  content: string;
  confidence: number;
}

function isNetworkError(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? err);
  return (
    msg.includes("ENOTFOUND") ||
    msg.includes("fetch failed") ||
    msg.includes("Failed to fetch") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("network error") ||
    msg.includes("Connection error")
  );
}

async function callLLM(
  userMessage: string,
  maxTokens: number,
  ctx: { sessionId: string; agentId: string; agentName: string }
): Promise<string> {
  try {
    const res = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: userMessage }],
    });
    return res.choices[0].message.content ?? "";
  } catch (groqErr) {
    if (!isNetworkError(groqErr)) throw groqErr;
    console.warn("[LLM] Groq unreachable, falling back to Ollama:", (groqErr as Error).message);
  }

  try {
    const res = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer ollama" },
      body: JSON.stringify({
        model: "llama3.2",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "";

    await apiWrite("log-event", {
      session_id: ctx.sessionId,
      agent_id: ctx.agentId,
      agent_name: ctx.agentName,
      event_type: "offline_mode",
      payload: { message: "Groq unreachable — running on local Ollama (llama3.2)" },
    }).catch(() => {});

    console.log("[LLM] Ollama fallback succeeded.");
    return text;
  } catch (ollamaErr) {
    throw new Error(
      "Agents unavailable — no LLM reachable (Groq offline and Ollama not running)"
    );
  }
}
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290

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
<<<<<<< HEAD
    await apiWrite("upsert-session", { id: sessionId, goal, status: "active" });

    const agentDefs = [
      { name: "orchestrator", type: "ai" },
      { name: "researcher",   type: "ai" },
      { name: "analyst",      type: "ai" },
      { name: "writer",       type: "ai" },
      { name: "human",        type: "human" },
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
    ];

    const agentIds: Record<string, string> = {};
    for (const def of agentDefs) {
<<<<<<< HEAD
      const result = await apiWrite("create-agent", {
        session_id: sessionId,
        name: def.name,
        type: def.type,
      });
      agentIds[def.name] = (result.id as string) ?? uuidv4();
    }

    await apiWrite("log-event", {
      session_id: sessionId,
      agent_id: agentIds["orchestrator"],
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
      agent_name: "system",
      event_type: "session_started",
      payload: { goal },
    });

<<<<<<< HEAD
    runPipeline(sessionId, goal, agentIds).catch((e) => {
      console.error("[Blackboard] Pipeline crashed:", e);
    });

    return { sessionId, status: "started", message: "Session started." };
  } catch (error: unknown) {
    console.error("[Blackboard] Session setup error:", error);
    return { sessionId, status: "error", message: (error as Error).message ?? "Unknown error" };
  }
}

async function runPipeline(sessionId: string, goal: string, agentIds: Record<string, string>) {
  try {
    const tasks    = await step1_orchestrator(sessionId, goal, agentIds["orchestrator"]);
    const findings = await step2_researcher(sessionId, agentIds["researcher"], tasks);
    const analysis = await step3_analyst(sessionId, agentIds["analyst"], findings);
    await step4_writer(sessionId, goal, agentIds["writer"], findings, analysis);

    await apiWrite("update-session", { id: sessionId, status: "completed" });
    console.log("[Blackboard] Session completed:", sessionId);
  } catch (err) {
    console.error("[Blackboard] Pipeline error:", err);
    await apiWrite("update-session", { id: sessionId, status: "failed" });
  }
}

async function step1_orchestrator(sessionId: string, goal: string, agentId: string): Promise<Task[]> {
  console.log("[Orchestrator] Starting...");
  await apiWrite("update-agent", { id: agentId, status: "working" });

  const text = await callLLM(
    `You are an orchestrator. The goal is: "${goal}".
Return ONLY a JSON array of 3 tasks (no markdown, no explanation):
[{"title": "...", "assigned_to": "researcher", "description": "..."},...]
Assign tasks to: researcher, analyst, or writer.`,
    1024,
    { sessionId, agentId, agentName: "orchestrator" }
  );

  console.log("[Orchestrator] Raw response:", text.slice(0, 200));

  let tasks: Task[] = [];
  try {
    const match = text.match(/\[[\s\S]*\]/);
    tasks = JSON.parse(match ? match[0] : text);
  } catch {
    console.error("[Orchestrator] JSON parse failed, using fallback tasks");
    tasks = [
      { title: `Research: ${goal}`, assigned_to: "researcher", description: "Gather key facts and information." },
      { title: `Analyze: ${goal}`, assigned_to: "analyst",    description: "Synthesize research into insights." },
      { title: `Write: ${goal}`,   assigned_to: "writer",     description: "Produce the final output." },
    ];
  }
  tasks = tasks.filter((t) => typeof t === "object" && t !== null && t.title && t.assigned_to);

  for (const t of tasks) {
    const result = await apiWrite("create-task", {
      session_id: sessionId,
      posted_by: agentId,
      title: t.title,
      description: t.description ?? "",
      assigned_to: t.assigned_to,
      priority: 3,
      status: "open",
    });
    t.id = result.id as string | undefined;
    await apiWrite("log-event", {
      session_id: sessionId,
      agent_id: agentId,
      agent_name: "orchestrator",
      event_type: "task_posted",
      entity_type: "task",
      entity_id: result.id,
    });
  }

  await apiWrite("create-artifact", {
    session_id: sessionId,
    agent_id: agentId,
    agent_name: "orchestrator",
    type: "finding",
    title: "Decomposition Plan",
    content: `Goal: ${goal}\n\nTasks created:\n${tasks.map((t) => `- [${t.assigned_to}] ${t.title}`).join("\n")}`,
    confidence: 0.9,
    status: "pending",
  });

  await apiWrite("update-agent", { id: agentId, status: "idle" });
  console.log("[Orchestrator] Done. Created", tasks.length, "tasks.");
  return tasks;
}

async function step2_researcher(sessionId: string, agentId: string, tasks: Task[]): Promise<Finding[]> {
  console.log("[Researcher] Starting...");
  await apiWrite("update-agent", { id: agentId, status: "working" });

  const myTasks = tasks.filter((t) => t.assigned_to === "researcher");
  console.log("[Researcher] Found", myTasks.length, "tasks.");
  const findings: Finding[] = [];

  for (const task of myTasks) {
    await apiWrite("update-task", { id: task.id, status: "in_progress" });

    const text = await callLLM(
      `You are a researcher. Research this task thoroughly and return ONLY JSON (no markdown):
{"title": "...", "content": "detailed findings...", "confidence": 0.0-1.0}

Task: "${task.title}"
Description: "${task.description ?? ""}"`,
      2048,
      { sessionId, agentId, agentName: "researcher" }
    );

    let title = `Research: ${task.title}`, content = text, confidence = 0.8;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : text);
      title = parsed.title ?? title;
      content = parsed.content ?? text;
      confidence = parsed.confidence ?? 0.8;
    } catch { /* use raw text as content */ }

    findings.push({ title, content, confidence });

    const artifact = await apiWrite("create-artifact", {
      session_id: sessionId,
      task_id: task.id,
      agent_id: agentId,
      agent_name: "researcher",
      type: "finding",
      title,
      content,
      confidence,
      status: confidence < 0.6 ? "escalated" : "pending",
      requires_human_review: confidence < 0.6,
    });
    await apiWrite("update-task", { id: task.id, status: "done" });
    await apiWrite("log-event", {
      session_id: sessionId,
      agent_id: agentId,
      agent_name: "researcher",
      event_type: "artifact_written",
      entity_type: "artifact",
      entity_id: artifact.id,
    });
    console.log("[Researcher] Wrote finding:", title);
  }

  await apiWrite("update-agent", { id: agentId, status: "idle" });
  console.log("[Researcher] Done.");
  return findings;
}

async function step3_analyst(sessionId: string, agentId: string, findings: Finding[]): Promise<Analysis> {
  console.log("[Analyst] Starting...");
  await apiWrite("update-agent", { id: agentId, status: "working" });

  const findingsText = findings.map((f) => `## ${f.title}\n${f.content}`).join("\n\n");

  const text = await callLLM(
    `You are an analyst. Synthesize these research findings and return ONLY JSON (no markdown):
{"title": "...", "content": "detailed analysis...", "confidence": 0.0-1.0}

Findings:
${findingsText}`,
    2048,
    { sessionId, agentId, agentName: "analyst" }
  );

  let title = "Analysis of Findings", content = text, confidence = 0.8;
  try {
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);
    title = parsed.title ?? title;
    content = parsed.content ?? text;
    confidence = parsed.confidence ?? 0.8;
  } catch { /* use raw text */ }

  const artifact = await apiWrite("create-artifact", {
    session_id: sessionId,
    agent_id: agentId,
    agent_name: "analyst",
    type: "analysis",
    title,
    content,
    confidence,
    status: "pending",
  });

  await apiWrite("update-task", { session_id: sessionId, assigned_to: "analyst", status: "done" });
  await apiWrite("update-agent", { id: agentId, status: "idle" });
  await apiWrite("log-event", {
    session_id: sessionId,
    agent_id: agentId,
    agent_name: "analyst",
    event_type: "artifact_written",
    entity_type: "artifact",
    entity_id: artifact.id,
  });
  console.log("[Analyst] Done. Wrote:", title);

  return { title, content, confidence };
}

async function step4_writer(sessionId: string, goal: string, agentId: string, findings: Finding[], analysis: Analysis): Promise<string> {
  console.log("[Writer] Starting...");
  await apiWrite("update-agent", { id: agentId, status: "working" });

  const context = [
    ...findings.map((f) => `### [FINDING] ${f.title}\n${f.content}`),
    `### [ANALYSIS] ${analysis.title}\n${analysis.content}`,
  ].join("\n\n");

  const text = await callLLM(
    `You are a writer. Produce a final comprehensive output for the goal and return ONLY JSON (no markdown):
{"title": "...", "content": "full final output...", "confidence": 0.0-1.0}

Goal: "${goal}"

Research & Analysis:
${context}`,
    4096,
    { sessionId, agentId, agentName: "writer" }
  );

  let title = `Final Output: ${goal.slice(0, 50)}`, content = text, confidence = 0.9;
  try {
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);
    title = parsed.title ?? title;
    content = parsed.content ?? text;
    confidence = parsed.confidence ?? 0.9;
  } catch { /* use raw text */ }

  const artifact = await apiWrite("create-artifact", {
    session_id: sessionId,
    agent_id: agentId,
    agent_name: "writer",
    type: "final",
    title,
    content,
    confidence,
    status: "pending",
  });

  await apiWrite("update-task", { session_id: sessionId, assigned_to: "writer", status: "done" });
  await apiWrite("update-agent", { id: agentId, status: "idle" });
  await apiWrite("log-event", {
    session_id: sessionId,
    agent_id: agentId,
    agent_name: "writer",
    event_type: "artifact_written",
    entity_type: "artifact",
    entity_id: artifact.id,
  });
  console.log("[Writer] Done. Wrote:", title);

  return content;
}
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
