// scripts/db-push.js — uses node-postgres (pg) directly
const { Client } = require("pg");
const path = require("path");
const fs = require("fs");

// Load .env.local
const envPath = path.join(__dirname, "../.env.local");
for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const idx = t.indexOf("=");
  if (idx === -1) continue;
  const key = t.slice(0, idx).trim();
  const val = t.slice(idx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("❌ DATABASE_URL not set"); process.exit(1); }

  console.log("🔌 Connecting to Neon...");
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const steps = [
    ["uuid-ossp extension",    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`],
    ["sessions table",         `CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      goal TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )`],
    ["agents table",           `CREATE TABLE IF NOT EXISTS agents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'idle',
      current_task_id UUID,
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`],
    ["tasks table",            `CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
      posted_by UUID REFERENCES agents(id),
      assigned_to TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      priority INTEGER DEFAULT 5,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )`],
    ["artifacts table",        `CREATE TABLE IF NOT EXISTS artifacts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
      task_id UUID REFERENCES tasks(id),
      agent_id UUID REFERENCES agents(id),
      agent_name TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      confidence REAL DEFAULT 0.8,
      parent_artifact_id UUID REFERENCES artifacts(id),
      status TEXT NOT NULL DEFAULT 'pending',
      requires_human_review BOOLEAN DEFAULT FALSE,
      human_note TEXT,
      tags TEXT[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`],
    ["blackboard_events table", `CREATE TABLE IF NOT EXISTS blackboard_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
      agent_id UUID REFERENCES agents(id),
      agent_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      entity_type TEXT,
      entity_id UUID,
      payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`],
    ["indexes",                `
      CREATE INDEX IF NOT EXISTS idx_tasks_session_status ON tasks(session_id, status);
      CREATE INDEX IF NOT EXISTS idx_artifacts_session ON artifacts(session_id);
      CREATE INDEX IF NOT EXISTS idx_artifacts_task ON artifacts(task_id);
      CREATE INDEX IF NOT EXISTS idx_artifacts_status ON artifacts(status);
      CREATE INDEX IF NOT EXISTS idx_events_session ON blackboard_events(session_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_agents_session ON agents(session_id)
    `],
    ["updated_at function",    `
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $func$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $func$ LANGUAGE plpgsql
    `],
    ["trigger: sessions",      `DROP TRIGGER IF EXISTS sessions_updated_at ON sessions;
      CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at()`],
    ["trigger: tasks",         `DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
      CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at()`],
    ["trigger: artifacts",     `DROP TRIGGER IF EXISTS artifacts_updated_at ON artifacts;
      CREATE TRIGGER artifacts_updated_at BEFORE UPDATE ON artifacts FOR EACH ROW EXECUTE FUNCTION update_updated_at()`],
  ];

  console.log(`📋 Running ${steps.length} steps...\n`);

  for (const [label, stmt] of steps) {
    try {
      await client.query(stmt);
      console.log(`  ✓ ${label}`);
    } catch (err) {
      console.error(`  ✗ ${label}: ${err.message}`);
    }
  }

  console.log("\n✅ Schema pushed! Verifying tables...");
  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  console.log("\nTables in database:");
  rows.forEach((r) => console.log(`  • ${r.tablename}`));

  await client.end();
  console.log("\n🎉 Done!");
}

main().catch((e) => { console.error(e); process.exit(1); });
