"use client";
import { useQuery } from "@tanstack/react-query";

const AGENT_CONFIG: Record<string, { color: string; icon: string; className: string }> = {
  orchestrator: { color: "#00d4ff", icon: "⬡", className: "agent-orchestrator" },
  researcher:   { color: "#60a5fa", icon: "◈", className: "agent-researcher" },
  analyst:      { color: "#a78bfa", icon: "◆", className: "agent-analyst" },
  writer:       { color: "#00e87a", icon: "◇", className: "agent-writer" },
  human:        { color: "#f5a623", icon: "○", className: "agent-human" },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  working: { color: "#00d4ff", bg: "rgba(0,212,255,0.1)", border: "rgba(0,212,255,0.3)", label: "WORKING" },
  idle:    { color: "#4a5568", bg: "rgba(74,85,104,0.1)", border: "rgba(74,85,104,0.3)", label: "IDLE" },
  waiting: { color: "#f5a623", bg: "rgba(245,166,35,0.1)", border: "rgba(245,166,35,0.3)", label: "WAITING" },
  done:    { color: "#00e87a", bg: "rgba(0,232,122,0.1)", border: "rgba(0,232,122,0.3)", label: "DONE" },
};

function getAgentConfig(name: string) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(AGENT_CONFIG)) {
    if (key.includes(k)) return v;
  }
  return { color: "var(--text-secondary)", icon: "◉", className: "" };
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function AgentStatusPanel({ sessionId }: { sessionId: string }) {
  const { data } = useQuery({
    queryKey: ["blackboard", sessionId, "agents"],
    queryFn: async () => {
      const res = await fetch(`/api/blackboard?session_id=${sessionId}`);
      return res.json();
    },
    refetchInterval: 2000,
  });

  const agents: { id: string; name: string; status: string; last_seen?: string }[] = data?.agents ?? [];

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "var(--text-secondary)",
            }}
          >
            AGENT ROSTER
          </span>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "var(--text-dim)",
          }}
        >
          {agents.length}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {agents.map((agent) => {
          const agentCfg = getAgentConfig(agent.name);
          const statusCfg = getStatusConfig(agent.status);
          const isWorking = agent.status === "working";

          return (
            <div
              key={agent.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: isWorking ? "rgba(0,212,255,0.03)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isWorking ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.04)"}`,
                transition: "all 0.3s",
              }}
            >
              {/* Status dot */}
              <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: statusCfg.color,
                    boxShadow: isWorking ? `0 0 8px ${statusCfg.color}` : "none",
                    animation: isWorking ? "pulse-dot 1.5s ease-in-out infinite" : "none",
                  }}
                />
                {isWorking && (
                  <div
                    style={{
                      position: "absolute",
                      inset: -4,
                      borderRadius: "50%",
                      border: `1px solid ${statusCfg.color}`,
                      animation: "pulse-ring 1.5s ease-out infinite",
                    }}
                  />
                )}
              </div>

              {/* Agent icon + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, color: agentCfg.color, flexShrink: 0 }}>{agentCfg.icon}</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: agentCfg.color,
                    textTransform: "capitalize",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {agent.name}
                </span>
              </div>

              {/* Status badge */}
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  padding: "2px 7px",
                  borderRadius: 4,
                  background: statusCfg.bg,
                  border: `1px solid ${statusCfg.border}`,
                  color: statusCfg.color,
                  letterSpacing: "0.08em",
                  flexShrink: 0,
                }}
              >
                {statusCfg.label}
              </div>

              {/* Last seen */}
              {agent.last_seen && (
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    flexShrink: 0,
                  }}
                >
                  {relativeTime(agent.last_seen)}
                </div>
              )}
            </div>
          );
        })}

        {agents.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-dim)",
            }}
          >
            No agents registered
          </div>
        )}
      </div>
    </div>
  );
}
