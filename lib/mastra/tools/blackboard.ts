import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { sql, logEvent } from "../../db";

export const readTasksTool = createTool({
  id: "read_tasks",
  description: "Read all open tasks from the blackboard. Returns tasks that are unclaimed or assigned to this agent.",
  inputSchema: z.object({
    session_id: z.string(),
    agent_name: z.string().optional(),
  }),
  outputSchema: z.object({
    tasks: z.array(z.any()),
  }),
  execute: async ({ context }) => {
    const { session_id, agent_name } = context;
    const tasks = await sql`
      SELECT t.*, a.name as posted_by_name
      FROM tasks t
      LEFT JOIN agents a ON a.id = t.posted_by
      WHERE t.session_id = ${session_id}
        AND t.status IN ('open', 'in_progress')
        AND (t.assigned_to IS NULL OR t.assigned_to = ${agent_name ?? ""})
      ORDER BY t.priority ASC, t.created_at ASC
    `;
    return { tasks };
  },
});

export const readArtifactsTool = createTool({
  id: "read_artifacts",
  description: "Read artifacts from the blackboard. Can filter by type or task_id.",
  inputSchema: z.object({
    session_id: z.string(),
    type: z.string().optional(),
    task_id: z.string().optional(),
    status: z.string().optional(),
  }),
  outputSchema: z.object({
    artifacts: z.array(z.any()),
  }),
  execute: async ({ context }) => {
    const { session_id, type, task_id, status } = context;
    const artifacts = await sql`
      SELECT a.*, pa.content as parent_content
      FROM artifacts a
      LEFT JOIN artifacts pa ON pa.id = a.parent_artifact_id
      WHERE a.session_id = ${session_id}
        AND (${type ?? null}::text IS NULL OR a.type = ${type ?? null})
        AND (${task_id ?? null}::text IS NULL OR a.task_id = ${task_id ?? null}::uuid)
        AND (${status ?? null}::text IS NULL OR a.status = ${status ?? null})
      ORDER BY a.created_at DESC
      LIMIT 20
    `;
    return { artifacts };
  },
});

export const postTaskTool = createTool({
  id: "post_task",
  description: "Post a new task to the blackboard for other agents to pick up.",
  inputSchema: z.object({
    session_id: z.string(),
    agent_id: z.string(),
    agent_name: z.string(),
    title: z.string(),
    description: z.string().optional(),
    assigned_to: z.string().optional(),
    priority: z.number().min(1).max(10).default(5),
  }),
  outputSchema: z.object({
    task_id: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ context }) => {
    const { session_id, agent_id, agent_name, title, description, assigned_to, priority } = context;
    const [task] = await sql`
      INSERT INTO tasks (session_id, posted_by, title, description, assigned_to, priority, status)
      VALUES (
        ${session_id}::uuid, ${agent_id}::uuid, ${title},
        ${description ?? null}, ${assigned_to ?? null}, ${priority}, 'open'
      )
      RETURNING id
    `;
    await logEvent({
      session_id, agent_id, agent_name,
      event_type: "task_posted",
      entity_type: "task",
      entity_id: task.id,
      payload: { title, assigned_to, priority },
    });
    return { task_id: task.id, success: true };
  },
});

export const claimTaskTool = createTool({
  id: "claim_task",
  description: "Claim a task from the blackboard to start working on it.",
  inputSchema: z.object({
    task_id: z.string(),
    agent_id: z.string(),
    agent_name: z.string(),
    session_id: z.string(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ context }) => {
    const { task_id, agent_id, agent_name, session_id } = context;
    await sql`
      UPDATE tasks
      SET status = 'in_progress', assigned_to = ${agent_name}, updated_at = NOW()
      WHERE id = ${task_id}::uuid
    `;
    await sql`
      UPDATE agents
      SET status = 'working', current_task_id = ${task_id}::uuid, last_seen = NOW()
      WHERE id = ${agent_id}::uuid
    `;
    await logEvent({ session_id, agent_id, agent_name, event_type: "task_claimed", entity_type: "task", entity_id: task_id });
    return { success: true };
  },
});

export const writeArtifactTool = createTool({
  id: "write_artifact",
  description: "Write a knowledge artifact to the blackboard.",
  inputSchema: z.object({
    session_id: z.string(),
    task_id: z.string().optional(),
    agent_id: z.string(),
    agent_name: z.string(),
    type: z.enum(["finding", "analysis", "draft", "final", "annotation"]),
    title: z.string(),
    content: z.string(),
    confidence: z.number().min(0).max(1).default(0.8),
    parent_artifact_id: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    artifact_id: z.string(),
    success: z.boolean(),
    requires_human_review: z.boolean(),
  }),
  execute: async ({ context }) => {
    const { session_id, task_id, agent_id, agent_name, type, title, content, confidence, parent_artifact_id, tags } = context;
    const requires_human_review = confidence < 0.6;
    const [artifact] = await sql`
      INSERT INTO artifacts (
        session_id, task_id, agent_id, agent_name, type, title, content,
        confidence, parent_artifact_id, status, requires_human_review, tags
      )
      VALUES (
        ${session_id}::uuid,
        ${task_id ?? null}::uuid,
        ${agent_id}::uuid,
        ${agent_name},
        ${type},
        ${title},
        ${content},
        ${confidence},
        ${parent_artifact_id ?? null}::uuid,
        ${requires_human_review ? "escalated" : "pending"},
        ${requires_human_review},
        ${tags ?? []}
      )
      RETURNING id
    `;
    if (task_id && (type === "final" || type === "analysis")) {
      await sql`UPDATE tasks SET status = 'done', completed_at = NOW(), updated_at = NOW() WHERE id = ${task_id}::uuid`;
    }
    await sql`UPDATE agents SET status = 'idle', current_task_id = NULL, last_seen = NOW() WHERE id = ${agent_id}::uuid`;
    await logEvent({
      session_id, agent_id, agent_name,
      event_type: "artifact_written",
      entity_type: "artifact",
      entity_id: artifact.id,
      payload: { type, title, confidence, requires_human_review },
    });
    return { artifact_id: artifact.id, success: true, requires_human_review };
  },
});

export const completeTaskTool = createTool({
  id: "complete_task",
  description: "Mark a task as completed on the blackboard.",
  inputSchema: z.object({
    task_id: z.string(),
    agent_id: z.string(),
    agent_name: z.string(),
    session_id: z.string(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ context }) => {
    const { task_id, agent_id, agent_name, session_id } = context;
    await sql`UPDATE tasks SET status = 'done', completed_at = NOW(), updated_at = NOW() WHERE id = ${task_id}::uuid`;
    await sql`UPDATE agents SET status = 'idle', current_task_id = NULL, last_seen = NOW() WHERE id = ${agent_id}::uuid`;
    await logEvent({ session_id, agent_id, agent_name, event_type: "task_completed", entity_type: "task", entity_id: task_id });
    return { success: true };
  },
});
