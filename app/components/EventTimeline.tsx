"use client";
import { useQuery } from "@tanstack/react-query";

<<<<<<< HEAD
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
=======
interface Event {
  id: string;
  agent_name: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

const EVENT_COLORS: Record<string, string> = {
  session_started: "var(--accent-primary)",
  session_completed: "var(--status-done)",
  task_posted: "var(--agent-orchestrator)",
  task_claimed: "var(--agent-researcher)",
  task_completed: "var(--status-done)",
  artifact_written: "var(--agent-writer)",
  artifact_reviewed: "var(--agent-human)",
};

export function EventTimeline({ sessionId }: { sessionId: string }) {
  const { data } = useQuery<{ events: Event[] }>({
    queryKey: ["events", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/blackboard?action=events&session_id=${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch events");
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
      return res.json();
    },
    refetchInterval: 3000,
  });

<<<<<<< HEAD
  const events: { id: string; event_type: string; agent_name: string; entity_type: string | null; created_at: string }[] =
    [...(data?.events ?? [])].reverse();
=======
  const events = data?.events ?? [];
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290

  if (events.length === 0) {
    return (
      <div
<<<<<<< HEAD
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
=======
        className="card flex items-center justify-center py-16"
        style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "monospace" }}
      >
        No events yet…
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
      </div>
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="card p-4">
      <h3
        className="font-mono text-xs font-semibold tracking-widest mb-4"
        style={{ color: "var(--text-dim)" }}
      >
        EVENT LOG
      </h3>
      <div className="flex flex-col gap-0">
        {events.map((event, i) => (
          <div key={event.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-1"
                style={{
                  background: EVENT_COLORS[event.event_type] ?? "var(--text-dim)",
                }}
              />
              {i < events.length - 1 && (
                <div
                  className="w-px flex-1 my-1"
                  style={{ background: "var(--bg-border)", minHeight: "12px" }}
                />
              )}
            </div>
            {/* Content */}
            <div className="pb-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-mono text-xs"
                  style={{ color: EVENT_COLORS[event.event_type] ?? "var(--text-dim)" }}
                >
                  {event.event_type.replace(/_/g, " ")}
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--text-dim)" }}
                >
                  by {event.agent_name}
                </span>
              </div>
              {event.payload && (
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "var(--text-dim)" }}
                >
                  {JSON.stringify(event.payload).slice(0, 80)}
                </p>
              )}
              <p
                className="font-mono text-xs mt-0.5"
                style={{ color: "var(--text-dim)", opacity: 0.5 }}
              >
                {new Date(event.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
      </div>
    </div>
  );
}
