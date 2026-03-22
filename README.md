# BlackBoard_MultiAgentSystem

## ✨ What Is Blackboard?

Every multi-agent AI framework today — LangGraph, CrewAI, AutoGen — shares a fatal flaw: **agents live in memory and die when the process dies.** They require constant cloud connectivity, lose all state on crashes, and coordinate through proprietary APIs that no human can inspect or query.

**Blackboard fixes this.**

We implemented the [Blackboard Architecture](https://en.wikipedia.org/wiki/Blackboard_system) — a classical AI coordination model first introduced in 1980 — using modern local-first infrastructure. Instead of agents calling each other through APIs, they communicate exclusively by reading and writing to a **shared local SQLite database**, synced in real-time to Neon via PowerSync.

### The Result

- 🔌 **Agents keep running when internet drops** — all state is local
- 💥 **Survives process crashes** — SQLite persists everything
- 🔍 **Query agent state with SQL** — no black boxes
- 👤 **Humans are first-class agents** — not observers
- 📼 **Full temporal replay** — append-only event log

---

## 🆚 How We Compare

| Capability | LangGraph | CrewAI | AutoGen | **Blackboard** |
|---|---|---|---|---|
| Works offline | ❌ | ❌ | ❌ | ✅ |
| Survives process crash | Cloud only | ❌ | ❌ | ✅ Local SQLite |
| Human as co-agent | Partial | Partial | Partial | ✅ Native |
| Queryable agent state | ❌ | ❌ | ❌ | ✅ Full SQL |
| Cross-device real-time sync | ❌ | ❌ | ❌ | ✅ PowerSync |
| Temporal replay / audit | Paid (LangSmith) | ❌ | ❌ | ✅ Built-in |
| Confidence propagation | ❌ | ❌ | ❌ | ✅ Per artifact |
| Local-first | ❌ | ❌ | ❌ | ✅ |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│   Next.js UI ←── TanStack Query ──→ PowerSync SQLite Client │
│                                           ↕ reactive sync   │
│                        Local SQLite DB (blackboard.db)      │
└─────────────────────────────────────────────────────────────┘
                                ↕ PowerSync (offline-first sync)
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS API (Server)                    │
│                                                             │
│   /api/run ──→ Mastra Workflow Runner                       │
│                  ├── Orchestrator Agent ──→ breaks goal     │
│                  ├── Researcher Agent   ──→ finds facts     │  
│                  ├── Analyst Agent      ──→ synthesizes     │
│                  └── Writer Agent       ──→ final output    │
│                            ↕ reads/writes via sql``         │
│                       Neon Postgres (ground truth)          │
│                                                             │
│   /api/blackboard ──→ CRUD write-back from PowerSync        │
│   /api/powersync/token ──→ JWT auth for sync                │
└─────────────────────────────────────────────────────────────┘
```

### Agent Communication Flow

```
Human posts goal
      ↓
Orchestrator → decomposes goal → writes 3-5 tasks to blackboard (SQLite/Neon)
      ↓
Researcher → reads open tasks → researches → writes findings as artifacts
      ↓  
Analyst → reads finding artifacts → synthesizes → writes analysis artifacts
      ↓
Writer → reads ALL artifacts → produces final output → writes final artifact
      ↓
Human → reviews each artifact → accepts / rejects / annotates
      ↓
PowerSync → syncs everything to Neon → all connected devices update instantly
```

**Key insight:** No agent ever calls another agent directly. The blackboard (local SQLite) is the only communication channel.

---

## 🔬 Technical Innovations

### 1. SQLite as Agent Message Bus
Agents coordinate via `INSERT` and `SELECT` — not HTTP calls. Agent state survives process death and is queryable with standard SQL at any time.

### 2. Confidence-Weighted Artifacts
Every artifact carries a `confidence` score (0.0–1.0). Low confidence auto-flags for human review. Uncertainty flows through the artifact lineage chain.

### 3. Human as Agent Zero
Humans are first-class participants on the blackboard — posting tasks, reviewing artifacts, annotating results. Not an afterthought.

### 4. Offline-Resilient Coordination
PowerSync enables zero-downtime disconnection. The entire coordination layer works offline. State reconciles automatically when connectivity returns.

### 5. Temporal Replay
Append-only event log captures every agent action with timestamps. Full session forensics. No other multi-agent framework provides this out of the box.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TanStack Query |
| Sync Engine | PowerSync (SQLite ↔ Neon) |
| Local Database | SQLite (via PowerSync embedded client) |
| Backend Database | Neon (Postgres) |
| Agent Framework | Mastra |
| AI Inference | Groq (llama-3.3-70b-versatile) |
| Styling | Tailwind CSS, Framer Motion |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) account (free)
- A [PowerSync](https://powersync.com) account (free)
- A [Groq](https://console.groq.com) API key (free)

### 1. Clone the repo

```bash
git clone https://github.com/ItsSwara/blackboard
cd blackboard
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Neon Postgres
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Groq (free inference)
GROQ_API_KEY=gsk_...

# PowerSync
NEXT_PUBLIC_POWERSYNC_URL=https://xxxxx.powersync.journeyapps.com
```

### 3. Set up Neon

```bash
npm run db:push
```

Then run this in your Neon SQL Editor:
```sql
CREATE PUBLICATION powersync FOR ALL TABLES;
```

### 4. Set up PowerSync

1. Create a new instance at [powersync.com](https://powersync.com)
2. Connect it to your Neon database
3. Enable **Development tokens** in Client Auth
4. Go to Sync Streams → paste these rules:

```yaml
bucket_definitions:
  global:
    data:
      - SELECT id, goal, status, created_at, updated_at, completed_at FROM sessions
      - SELECT id, session_id, name, type, status, current_task_id, last_seen, created_at FROM agents
      - SELECT id, session_id, posted_by, assigned_to, title, description, status, priority, created_at, updated_at, completed_at FROM tasks
      - SELECT id, session_id, task_id, agent_id, agent_name, type, title, content, confidence, parent_artifact_id, status, requires_human_review, human_note, tags::text AS tags, created_at, updated_at FROM artifacts
      - SELECT id, session_id, agent_id, agent_name, event_type, entity_type, entity_id, payload::text AS payload, created_at FROM blackboard_events
```

### 5. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🧪 Testing Offline Mode

1. Open the app and run a session to completion
2. Open DevTools (`F12`) → Network tab → set to **Offline**
3. Watch the sync indicator change to **OFFLINE**
4. Browse artifacts, post tasks, review outputs — all still works
5. Go back **Online** — PowerSync reconciles instantly

---

## 📁 Project Structure

```
blackboard/
├── app/
│   ├── api/
│   │   ├── blackboard/route.ts      # CRUD + human review actions
│   │   ├── run/route.ts             # Start agent sessions
│   │   └── powersync/token/route.ts # JWT auth for PowerSync
│   ├── components/
│   │   ├── ArtifactFeed.tsx         # Live blackboard artifact view
│   │   ├── AgentStatusPanel.tsx     # Real-time agent status
│   │   ├── TaskBoard.tsx            # Kanban task board
│   │   ├── EventTimeline.tsx        # Append-only event log
│   │   ├── GoalInput.tsx            # Session launcher
│   │   └── ReviewModal.tsx          # Human-in-the-loop UI
│   ├── globals.css                  # Design system
│   └── page.tsx                     # Main dashboard
├── db/
│   └── schema.sql                   # Neon Postgres schema
├── lib/
│   ├── db.ts                        # Neon client
│   ├── mastra/
│   │   ├── index.ts                 # Agent pipeline + Mastra workflow
│   │   └── tools/blackboard.ts      # Read/write tools for agents
│   └── powersync/
│       ├── schema.ts                # SQLite schema definition
│       ├── connector.ts             # Neon write-back connector
│       └── provider.tsx             # React provider + useQuery hook
├── powersync.yaml                   # Sync rules
└── .env.example                     # Environment template
```

---

## 📚 Academic References

- Nii, H.P. (1986). *Blackboard Systems*. AI Magazine, 7(3)
- Hayes-Roth, B. (1985). *A Blackboard Architecture for Control*. Artificial Intelligence, 26
- Han, B. et al. (2025). *Exploring Advanced LLM Multi-Agent Systems Based on Blackboard Architecture*. [arXiv:2507.01701](https://arxiv.org/abs/2507.01701)
- Google Research (2025). *Blackboard Multi-Agent Systems for Information Discovery in Data Science*. [arXiv:2510.01285](https://arxiv.org/abs/2510.01285)
- Kleppmann, M. et al. (2019). *Local-First Software*. Ink & Switch

---

## 👥 Team
-Swara Shetye
-Shreyashi Kaitke
-Prajakta Vetale

Built for the **PowerSync Hackathon 2026**
