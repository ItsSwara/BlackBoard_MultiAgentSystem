"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface GoalInputProps {
<<<<<<< HEAD
  onSessionStart: (id: string) => void;
=======
  onSessionStart: (sessionId: string) => void;
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
  activeSessionId: string | null;
}

export function GoalInput({ onSessionStart, activeSessionId }: GoalInputProps) {
  const [goal, setGoal] = useState("");

  const { mutate, isPending } = useMutation({
<<<<<<< HEAD
    mutationFn: async () => {
=======
    mutationFn: async (goal: string) => {
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      onSessionStart(data.sessionId);
      setGoal("");
    },
  });

<<<<<<< HEAD
  const canLaunch = !isPending && goal.trim().length > 0;

  return (
    <div
      className="glass-card-cyan"
      style={{
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top glow line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--cyan)",
              boxShadow: "0 0 8px var(--cyan)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "var(--cyan)",
            }}
          >
            NEW SESSION
          </span>
        </div>

        {activeSessionId && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              padding: "2px 8px",
              borderRadius: 4,
              background: "rgba(0,212,255,0.06)",
              border: "1px solid rgba(0,212,255,0.15)",
              color: "rgba(0,212,255,0.6)",
              letterSpacing: "0.08em",
            }}
          >
            {activeSessionId.slice(0, 8).toUpperCase()}…
          </div>
        )}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: 11,
          color: "var(--text-dim)",
          marginBottom: 8,
          letterSpacing: "0.03em",
        }}
      >
        Intelligence Goal
      </div>

      {/* Textarea */}
      <textarea
        rows={5}
        placeholder="Define your intelligence goal..."
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        style={{
          resize: "none",
          marginBottom: 14,
          lineHeight: 1.6,
          fontSize: 13,
        }}
      />

      {/* Launch button */}
      <button
        disabled={!canLaunch}
        onClick={() => mutate()}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.12em",
          cursor: canLaunch ? "pointer" : "not-allowed",
          transition: "all 0.25s",
          border: "1px solid",
          position: "relative",
          overflow: "hidden",
          ...(canLaunch
            ? {
                background: "rgba(0,212,255,0.12)",
                borderColor: "rgba(0,212,255,0.5)",
                color: "var(--cyan)",
                boxShadow: "0 0 24px rgba(0,212,255,0.15), inset 0 1px 0 rgba(0,212,255,0.1)",
              }
            : {
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
                color: "var(--text-dim)",
              }),
        }}
      >
        {isPending ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ animation: "pulse-dot 1s ease-in-out infinite" }}>◎</span>
            INITIALIZING…
          </span>
        ) : (
          "LAUNCH TASK →"
        )}
      </button>
=======
  return (
    <div className="card p-4">
      <h2
        className="font-mono text-xs font-semibold tracking-widest mb-3"
        style={{ color: "var(--accent-primary)" }}
      >
        ⬡ NEW SESSION
      </h2>
      {activeSessionId && (
        <div
          className="text-xs font-mono mb-3 px-2 py-1 rounded"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--accent-dim)",
            border: "1px solid var(--bg-border)",
          }}
        >
          Active: {activeSessionId.slice(0, 8)}…
        </div>
      )}
      <textarea
        className="w-full p-2 text-sm resize-none mb-3"
        rows={3}
        placeholder="Enter your goal for the agent swarm…"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && goal.trim()) {
            mutate(goal.trim());
          }
        }}
      />
      <button
        className="btn-primary w-full py-2 text-sm font-mono"
        disabled={isPending || !goal.trim()}
        onClick={() => goal.trim() && mutate(goal.trim())}
      >
        {isPending ? "Launching…" : "Launch Agent Swarm"}
      </button>
      <p
        className="text-xs mt-2 text-center"
        style={{ color: "var(--text-dim)" }}
      >
        Ctrl+Enter to submit
      </p>
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
    </div>
  );
}
