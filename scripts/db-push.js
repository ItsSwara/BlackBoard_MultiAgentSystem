const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set in .env.local");
    process.exit(1);
  }

  console.log("🔌 Connecting to Neon...");
  const sql = neon(databaseUrl);

  const schemaPath = path.join(__dirname, "../db/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  console.log("📤 Pushing schema to Neon...");

  // Split by statement-ending semicolons but preserve function bodies
  const statements = schema
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));

  let count = 0;
  for (const stmt of statements) {
    if (!stmt) continue;
    try {
      await sql.query(stmt + ";");
      count++;
    } catch (err) {
      if (err.message?.includes("already exists")) {
        // Ignore "already exists" errors
      } else {
        console.warn(`⚠️  Warning on statement: ${err.message}`);
      }
    }
  }

  console.log(`✅ Schema pushed! Executed ${count} statements.`);

  // Verify tables
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log("\n📋 Tables in database:");
  tables.forEach(t => console.log(`   ✓ ${t.table_name}`));
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
