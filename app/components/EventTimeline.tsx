"use client";
import { useQuery } from "@tanstack/react-query";

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
      return res.json();
    },
    refetchInterval: 3000,
  });

  const events = data?.events ?? [];

  if (events.length === 0) {
    return (
      <div
        className="card flex items-center justify-center py-16"
        style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "monospace" }}
      >
        No events yet…
      </div>
    );
  }

  return (
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
      </div>
    </div>
  );
}
