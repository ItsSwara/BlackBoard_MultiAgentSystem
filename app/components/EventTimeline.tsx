"use client";
import { useQuery } from "@tanstack/react-query";

const AGENT_COLORS: Record<string, string> = {
  orchestrator: "#00d4ff",
  researcher: "#60a5fa",
  analyst: "#a78bfa",
  writer: "#00e87a",
  human: "#f5a623",
};

function getAgentColor(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(AGENT_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#8892a4";
}

function formatEventType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

function getEventIcon(eventType: string): string {
  if (eventType.includes("artifact")) return "◈";
  if (eventType.includes("task")) return "▦";
  if (eventType.includes("complete") || eventType.includes("done")) return "✓";
  if (eventType.includes("start") || eventType.includes("begin")) return "▶";
  if (eventType.includes("error") || eventType.includes("fail")) return "✗";
  if (eventType.includes("review") || eventType.includes("human")) return "○";
  return "◉";
}

export function EventTimeline({ sessionId }: { sessionId: string }) {
  const { data } = useQuery({
    queryKey: ["blackboard", sessionId, "events"],
    queryFn: async () => {
      const res = await fetch(`/api/blackboard?session_id=${sessionId}`);
      return res.json();
    },
    refetchInterval: 3000,
  });

  const events: { id: string; event_type: string; agent_name: string; entity_type: string | null; created_at: string }[] =
    [...(data?.events ?? [])].reverse();

  if (events.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          padding: 48,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          minHeight: 200,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--cyan)",
                opacity: 0.4,
                animation: `pulse-dot 1.5s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--text-dim)",
            letterSpacing: "0.08em",
          }}
        >
          No events yet.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      {/* Header */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "var(--text-secondary)",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>EVENT STREAM</span>
        <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>{events.length} events</span>
      </div>

      <div style={{ position: "relative" }}>
        {/* Vertical connecting line */}
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 6,
            bottom: 6,
            width: 1,
            background: "linear-gradient(180deg, rgba(0,212,255,0.3), rgba(255,255,255,0.04) 80%, transparent)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {events.map((e, i) => {
            const color = getAgentColor(e.agent_name);
            const icon = getEventIcon(e.event_type);
            const isFirst = i === 0;

            return (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  paddingBottom: i < events.length - 1 ? 16 : 0,
                  animation: "slide-in-right 0.3s ease-out",
                }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    position: "relative",
                    width: 21,
                    height: 21,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 21,
                      height: 21,
                      borderRadius: "50%",
                      background: isFirst ? `${color}20` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isFirst ? color : "rgba(255,255,255,0.08)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      color: isFirst ? color : "var(--text-dim)",
                      zIndex: 1,
                    }}
                  >
                    {icon}
                  </div>
                  {isFirst && (
                    <div
                      style={{
                        position: "absolute",
                        inset: -3,
                        borderRadius: "50%",
                        border: `1px solid ${color}`,
                        animation: "pulse-ring 2s ease-out infinite",
                        zIndex: 0,
                      }}
                    />
                  )}
                </div>

                {/* Event content */}
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        fontWeight: 600,
                        color: color,
                      }}
                    >
                      {e.agent_name}
                    </span>
                    {e.entity_type && (
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          padding: "1px 6px",
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "var(--text-dim)",
                        }}
                      >
                        {e.entity_type}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {formatEventType(e.event_type)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9,
                        color: "var(--text-dim)",
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {relativeTime(e.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
