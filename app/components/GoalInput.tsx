"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface GoalInputProps {
  onSessionStart: (sessionId: string) => void;
  activeSessionId: string | null;
}

export function GoalInput({ onSessionStart, activeSessionId }: GoalInputProps) {
  const [goal, setGoal] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async (goal: string) => {
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
    </div>
  );
}
