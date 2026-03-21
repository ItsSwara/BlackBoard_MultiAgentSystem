"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GoalInput } from "./components/GoalInput";
import { AgentStatusPanel } from "./components/AgentStatusPanel";
import { TaskBoard } from "./components/TaskBoard";
import { ArtifactFeed } from "./components/ArtifactFeed";
import { EventTimeline } from "./components/EventTimeline";
import { ReviewModal } from "./components/ReviewModal";
import { SyncStatus } from "./components/SyncStatus";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reviewArtifact, setReviewArtifact] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"artifacts" | "tasks" | "events">(
    "artifacts"
  );
  const qc = useQueryClient();

  const { mutateAsync: submitReview } = useMutation({
    mutationFn: async ({
      artifactId,
      status,
      note,
    }: {
      artifactId: string;
      status: string;
      note: string;
    }) => {
      const res = await fetch("/api/blackboard?action=review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifact_id: artifactId,
          status,
          note,
          session_id: sessionId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  return (
    <div
      className="min-h-screen grid-bg scanlines"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Top bar */}
      <header
        className="border-b flex items-center justify-between px-6 py-3"
        style={{
          borderColor: "var(--bg-border)",
          background: "rgba(10,11,13,0.95)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="font-mono text-base font-semibold tracking-widest"
            style={{ color: "var(--accent-primary)" }}
          >
            ⬡ BLACKBOARD
          </div>
          {sessionId && (
            <div
              className="font-mono text-xs px-2 py-0.5 rounded"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--bg-border)",
                color: "var(--text-dim)",
              }}
            >
              {sessionId.slice(0, 8)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <SyncStatus />
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* ── Left sidebar ─────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <GoalInput
              onSessionStart={(id) => {
                setSessionId(id);
                setActiveTab("artifacts");
              }}
              activeSessionId={sessionId}
            />

            {sessionId && (
              <>
                <AgentStatusPanel sessionId={sessionId} />
              </>
            )}
          </div>

          {/* ── Main content area ─────────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Tabs */}
            {sessionId && (
              <div
                className="flex gap-1 p-1 rounded"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
              >
                {(["artifacts", "tasks", "events"] as const).map((tab) => (
                  <button
                    key={tab}
                    className="flex-1 py-1.5 rounded font-mono text-xs transition-all"
                    style={{
                      background:
                        activeTab === tab ? "var(--bg-elevated)" : "transparent",
                      color:
                        activeTab === tab
                          ? "var(--text-primary)"
                          : "var(--text-dim)",
                      border:
                        activeTab === tab
                          ? "1px solid var(--bg-border)"
                          : "1px solid transparent",
                    }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Tab content */}
            {!sessionId ? (
              <WelcomeScreen />
            ) : activeTab === "artifacts" ? (
              <ArtifactFeed
                sessionId={sessionId}
                onReview={setReviewArtifact}
              />
            ) : activeTab === "tasks" ? (
              <TaskBoard sessionId={sessionId} />
            ) : (
              <EventTimeline sessionId={sessionId} />
            )}
          </div>

          {/* ── Right sidebar ─────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {sessionId && (
              <>
                <HumanTaskPost sessionId={sessionId} />
                <OfflineBanner />
                <ArchitectureNote />
              </>
            )}
            {!sessionId && (
              <div className="flex flex-col gap-4">
                <OfflineBanner />
                <ArchitectureNote />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Review modal */}
      {reviewArtifact && (
        <ReviewModal
          artifact={reviewArtifact}
          onClose={() => setReviewArtifact(null)}
          onSubmit={async (artifactId, status, note) => {
            await submitReview({ artifactId, status, note });
          }}
        />
      )}
    </div>
  );
}

// ── Human task posting ───────────────────────────────────────
function HumanTaskPost({ sessionId }: { sessionId: string }) {
  const [title, setTitle] = useState("");
  const [assignTo, setAssignTo] = useState("researcher");
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/blackboard?action=post-task", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          title,
          assigned_to: assignTo,
          priority: 2,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      setTitle("");
      qc.invalidateQueries();
    },
  });

  return (
    <div className="card p-4">
      <h3
        className="font-mono text-xs mb-3"
        style={{ color: "var(--agent-human)" }}
      >
        ◉ POST TASK AS HUMAN
      </h3>
      <input
        type="text"
        className="w-full p-2 text-sm mb-2"
        placeholder="Task title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && title.trim() && mutate()}
      />
      <div className="flex gap-2">
        <select
          className="flex-1 p-2 text-xs font-mono"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            color: "var(--text-secondary)",
            borderRadius: "4px",
          }}
          value={assignTo}
          onChange={(e) => setAssignTo(e.target.value)}
        >
          <option value="researcher">researcher</option>
          <option value="analyst">analyst</option>
          <option value="writer">writer</option>
        </select>
        <button
          className="btn-primary px-3 py-2 text-xs font-mono"
          disabled={isPending || !title.trim()}
          onClick={() => mutate()}
        >
          {isPending ? "…" : "Post"}
        </button>
      </div>
    </div>
  );
}

// ── Offline banner ───────────────────────────────────────────
function OfflineBanner() {
  return (
    <div
      className="card p-4"
      style={{ borderColor: "rgba(245,158,11,0.2)" }}
    >
      <h3 className="font-mono text-xs mb-2" style={{ color: "var(--accent-primary)" }}>
        ⚡ LOCAL-FIRST
      </h3>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
        This app runs offline. All agent state lives in local SQLite via PowerSync.
        Disconnect your internet — agents keep working. Reconnect — state reconciles with Neon.
      </p>
    </div>
  );
}

// ── Architecture callout ─────────────────────────────────────
function ArchitectureNote() {
  return (
    <div className="card p-4">
      <h3 className="font-mono text-xs mb-2" style={{ color: "var(--text-dim)" }}>
        HOW IT WORKS
      </h3>
      <div className="flex flex-col gap-2">
        {[
          { icon: "⬡", label: "Orchestrator", desc: "Decomposes goal → tasks" },
          { icon: "◎", label: "Researcher", desc: "Finds facts → findings" },
          { icon: "◈", label: "Analyst", desc: "Synthesizes → analysis" },
          { icon: "✦", label: "Writer", desc: "Drafts → final output" },
          { icon: "◉", label: "Human", desc: "Reviews & annotates" },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-2">
            <span
              className="font-mono text-sm shrink-0 mt-0.5"
              style={{ color: "var(--accent-dim)" }}
            >
              {item.icon}
            </span>
            <div>
              <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                {item.label}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                {" "}— {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-3 pt-3 font-mono text-xs"
        style={{
          borderTop: "1px solid var(--bg-border)",
          color: "var(--text-dim)",
        }}
      >
        Agents communicate only via shared SQLite — no direct API calls between agents.
      </div>
    </div>
  );
}

// ── Welcome screen ───────────────────────────────────────────
function WelcomeScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 gap-6 card"
      style={{ minHeight: "400px" }}
    >
      <div
        className="font-mono text-6xl animate-glow"
        style={{ color: "var(--accent-primary)", opacity: 0.3 }}
      >
        ⬡
      </div>
      <div className="text-center">
        <h2
          className="font-mono text-sm font-semibold tracking-widest mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          BLACKBOARD READY
        </h2>
        <p
          className="text-sm max-w-xs"
          style={{ color: "var(--text-dim)" }}
        >
          Enter a goal on the left to launch the agent swarm. Watch them collaborate on the shared blackboard in real-time.
        </p>
      </div>
      <div
        className="font-mono text-xs px-4 py-2 rounded"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--bg-border)",
          color: "var(--text-dim)",
        }}
      >
        local SQLite · synced via PowerSync · offline-capable
      </div>
    </div>
  );
}
