import { column, Schema, Table } from "@powersync/web";

const sessions = new Table({
  goal: column.text,
  status: column.text,
  created_at: column.text,
  updated_at: column.text,
  completed_at: column.text,
});

const agents = new Table({
  session_id: column.text,
  name: column.text,
  type: column.text,
  status: column.text,
  current_task_id: column.text,
  last_seen: column.text,
  created_at: column.text,
});

const tasks = new Table({
  session_id: column.text,
  posted_by: column.text,
  assigned_to: column.text,
  title: column.text,
  description: column.text,
  status: column.text,
  priority: column.integer,
  created_at: column.text,
  updated_at: column.text,
  completed_at: column.text,
});

const artifacts = new Table({
  session_id: column.text,
  task_id: column.text,
  agent_id: column.text,
  agent_name: column.text,
  type: column.text,
  title: column.text,
  content: column.text,
  confidence: column.real,
  parent_artifact_id: column.text,
  status: column.text,
  requires_human_review: column.integer,
  human_note: column.text,
  tags: column.text,
  created_at: column.text,
  updated_at: column.text,
});

const blackboard_events = new Table({
  session_id: column.text,
  agent_id: column.text,
  agent_name: column.text,
  event_type: column.text,
  entity_type: column.text,
  entity_id: column.text,
  payload: column.text,
  created_at: column.text,
});

export const AppSchema = new Schema({
  sessions,
  agents,
  tasks,
  artifacts,
  blackboard_events,
});

export type Database = (typeof AppSchema)["types"];
