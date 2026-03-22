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
  const [reviewArtifact, setReviewArtifact] = useState<{ id: string; title: string; content: string; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"artifacts" | "tasks" | "events">("artifacts");
  const qc = useQueryClient();

  const { mutateAsync: submitReview } = useMutation({
    mutationFn: async ({ artifactId, status, note }: { artifactId: string; status: string; note: string }) => {
      const res = await fetch("/api/blackboard?action=review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifact_id: artifactId, status, note, session_id: sessionId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  const TAB_CONFIG = {
    artifacts: { label: "ARTIFACTS", icon: "◈" },
    tasks: { label: "TASKS", icon: "▦" },
    events: { label: "EVENTS", icon: "◎" },
  } as const;

  return (
    <div className="min-h-screen dot-grid" style={{ background: "var(--bg-base)" }}>
      {/* Animated top progress bar — visible when session is active */}
      {sessionId && (
        <div className="top-progress" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }} />
      )}

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(8,12,20,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "rgba(0,212,255,0.1)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "var(--cyan)",
                }}
              >
                ⬡
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "var(--text-primary)",
                }}
              >
                BLACKBOARD
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  paddingLeft: 4,
                }}
              >
                MISSION CONTROL
              </span>
            </div>

            {/* Session badge */}
            {sessionId && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  padding: "3px 10px",
                  borderRadius: 4,
                  background: "rgba(0,212,255,0.07)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  color: "var(--cyan)",
                  letterSpacing: "0.05em",
                }}
              >
                SESSION · {sessionId.slice(0, 8).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <SyncStatus />
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Left sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <GoalInput onSessionStart={(id) => { setSessionId(id); setActiveTab("artifacts"); }} activeSessionId={sessionId} />
            {sessionId && <AgentStatusPanel sessionId={sessionId} />}
          </div>

          {/* Main content */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {sessionId && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  padding: 4,
                  borderRadius: 10,
                  background: "rgba(13,20,32,0.8)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {(["artifacts", "tasks", "events"] as const).map((tab) => (
                  <button
                    key={tab}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 7,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: activeTab === tab ? "rgba(0,212,255,0.08)" : "transparent",
                      color: activeTab === tab ? "var(--cyan)" : "var(--text-dim)",
                      border: activeTab === tab ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
                    }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {TAB_CONFIG[tab].icon} {TAB_CONFIG[tab].label}
                  </button>
                ))}
              </div>
            )}

            {!sessionId ? (
              <WelcomeScreen />
            ) : activeTab === "artifacts" ? (
              <ArtifactFeed sessionId={sessionId} onReview={(a) => setReviewArtifact(a as { id: string; title: string; content: string; type: string })} />
            ) : activeTab === "tasks" ? (
              <TaskBoard sessionId={sessionId} />
            ) : (
              <EventTimeline sessionId={sessionId} />
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <ArchitectureNote />
          </div>
        </div>
      </main>

      {reviewArtifact && (
        <ReviewModal
          artifact={reviewArtifact}
          onClose={() => setReviewArtifact(null)}
          onSubmit={async (artifactId, status, note) => { await submitReview({ artifactId, status, note }); }}
        />
      )}
    </div>
  );
}

function ArchitectureNote() {
  const agents = [
    { label: "Orchestrator", icon: "⬡", desc: "Decomposes goal → tasks", color: "var(--cyan)" },
    { label: "Researcher", icon: "◈", desc: "Finds facts → findings", color: "#60a5fa" },
    { label: "Analyst", icon: "◆", desc: "Synthesizes → analysis", color: "var(--purple)" },
    { label: "Writer", icon: "◇", desc: "Drafts → final output", color: "var(--emerald)" },
    { label: "Human", icon: "○", desc: "Reviews & annotates", color: "var(--amber)" },
  ];

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "var(--text-dim)",
          marginBottom: 16,
        }}
      >
        SYSTEM ARCHITECTURE
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {agents.map((agent) => (
          <div key={agent.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 12, color: agent.color, marginTop: 1, flexShrink: 0 }}>{agent.icon}</span>
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: agent.color,
                  marginBottom: 2,
                }}
              >
                {agent.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>{agent.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "var(--text-dim)",
          lineHeight: 1.6,
        }}
      >
        Agents communicate only via shared Postgres — no direct API calls between agents.
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div
      className="glass-card"
      style={{
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 48,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            fontSize: 64,
            color: "var(--cyan)",
            opacity: 0.2,
            lineHeight: 1,
            fontFamily: "system-ui",
          }}
        >
          ⬡
        </div>
        <div
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.1)",
            animation: "pulse-ring 3s ease-out infinite",
          }}
        />
      </div>

      {/* Text */}
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          BLACKBOARD READY
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-dim)",
            lineHeight: 1.7,
            maxWidth: 280,
          }}
        >
          Enter a goal on the left to launch the agent swarm. Watch them collaborate on the shared blackboard in real-time.
        </p>
      </div>

      {/* Status dots */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {["System", "Agents", "Database"].map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--emerald)",
                boxShadow: "0 0 6px var(--emerald)",
                animation: `pulse-dot 2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "var(--text-dim)",
                letterSpacing: "0.08em",
              }}
            >
              {label.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
