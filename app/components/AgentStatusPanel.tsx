"use client";
import { useQuery } from "@tanstack/react-query";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  current_task_id: string | null;
  last_seen: string;
}

const AGENT_COLORS: Record<string, string> = {
  orchestrator: "var(--agent-orchestrator)",
  researcher: "var(--agent-researcher)",
  analyst: "var(--agent-analyst)",
  writer: "var(--agent-writer)",
  human: "var(--agent-human)",
};

const STATUS_COLORS: Record<string, string> = {
  idle: "var(--status-idle)",
  working: "var(--status-working)",
  done: "var(--status-done)",
};

export function AgentStatusPanel({ sessionId }: { sessionId: string }) {
  const { data } = useQuery<{ agents: Agent[] }>({
    queryKey: ["agents", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/blackboard?action=agents&session_id=${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
    refetchInterval: 2000,
  });

  const agents = data?.agents ?? [];

  return (
    <div className="card p-4">
      <h3
        className="font-mono text-xs font-semibold tracking-widest mb-3"
        style={{ color: "var(--text-dim)" }}
      >
        AGENTS
      </h3>
      <div className="flex flex-col gap-2">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full pulse-dot"
                style={{
                  background: agent.status === "working"
                    ? "var(--status-working)"
                    : agent.status === "done"
                    ? "var(--status-done)"
                    : "var(--status-idle)",
                }}
              />
              <span
                className="font-mono text-xs"
                style={{ color: AGENT_COLORS[agent.name] ?? "var(--text-secondary)" }}
              >
                {agent.name}
              </span>
            </div>
            <span
              className="font-mono text-xs"
              style={{ color: STATUS_COLORS[agent.status] ?? "var(--text-dim)" }}
            >
              {agent.status}
            </span>
          </div>
        ))}
        {agents.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            No agents registered yet.
          </p>
        )}
      </div>
    </div>
  );
}
