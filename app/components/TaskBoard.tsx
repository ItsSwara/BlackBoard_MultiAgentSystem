"use client";
import { useQuery } from "@tanstack/react-query";

<<<<<<< HEAD
const STATUS_COLS = ["open", "in_progress", "done"] as const;

const COL_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dimColor: string }> = {
  open: {
    label: "OPEN",
    color: "#00d4ff",
    bg: "rgba(0,212,255,0.05)",
    border: "rgba(0,212,255,0.2)",
    dimColor: "rgba(0,212,255,0.1)",
  },
  in_progress: {
    label: "IN PROGRESS",
    color: "#f5a623",
    bg: "rgba(245,166,35,0.05)",
    border: "rgba(245,166,35,0.2)",
    dimColor: "rgba(245,166,35,0.1)",
  },
  done: {
    label: "DONE",
    color: "#00e87a",
    bg: "rgba(0,232,122,0.05)",
    border: "rgba(0,232,122,0.2)",
    dimColor: "rgba(0,232,122,0.1)",
  },
};

const AGENT_COLORS: Record<string, string> = {
  orchestrator: "#00d4ff",
  researcher: "#60a5fa",
  analyst: "#a78bfa",
  writer: "#00e87a",
  human: "#f5a623",
};

function getAgentColor(name: string | null): string {
  if (!name) return "#4a5568";
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(AGENT_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#8892a4";
}

const PRIORITY_COLORS = ["#4a5568", "#60a5fa", "#f5a623", "#ff4466"];

export function TaskBoard({ sessionId }: { sessionId: string }) {
  const { data } = useQuery({
    queryKey: ["blackboard", sessionId, "tasks"],
    queryFn: async () => {
      const res = await fetch(`/api/blackboard?session_id=${sessionId}`);
      return res.json();
    },
    refetchInterval: 2000,
  });

  const tasks: { id: string; title: string; status: string; assigned_to: string | null; priority: number }[] =
    data?.tasks ?? [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {STATUS_COLS.map((col) => {
        const cfg = COL_CONFIG[col];
        const colTasks = tasks.filter((t) => t.status === col);

        return (
          <div
            key={col}
            style={{
              background: "rgba(13,20,32,0.7)",
              backdropFilter: "blur(12px)",
              border: `1px solid rgba(255,255,255,0.06)`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Column header with colored top border */}
            <div
              style={{
                borderTop: `2px solid ${cfg.color}`,
                padding: "12px 14px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: cfg.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: cfg.color,
                }}
              >
                {cfg.label}
              </span>

              {/* Count badge */}
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 4,
                  background: cfg.dimColor,
                  border: `1px solid ${cfg.border}`,
                  color: cfg.color,
                  minWidth: 22,
                  textAlign: "center",
                }}
              >
                {colTasks.length}
              </div>
            </div>

            {/* Tasks */}
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  {/* Agent chip */}
                  {task.assigned_to && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 6,
                        padding: "2px 7px",
                        borderRadius: 4,
                        background: `${getAgentColor(task.assigned_to)}15`,
                        border: `1px solid ${getAgentColor(task.assigned_to)}30`,
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: getAgentColor(task.assigned_to),
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          fontWeight: 600,
                          color: getAgentColor(task.assigned_to),
                          letterSpacing: "0.06em",
                        }}
                      >
                        {task.assigned_to}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-primary)",
                      lineHeight: 1.4,
                      marginBottom: task.priority > 0 ? 6 : 0,
                    }}
                  >
                    {task.title}
                  </div>

                  {/* Priority indicator */}
                  {task.priority > 0 && (
                    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                      {[1, 2, 3].map((p) => (
                        <div
                          key={p}
                          style={{
                            width: 14,
                            height: 3,
                            borderRadius: 2,
                            background:
                              p <= task.priority
                                ? PRIORITY_COLORS[Math.min(task.priority, 3)] ?? "#4a5568"
                                : "rgba(255,255,255,0.06)",
                          }}
                        />
                      ))}
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          color: "var(--text-dim)",
                          marginLeft: 4,
                        }}
                      >
                        P{task.priority}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {colTasks.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 0",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    letterSpacing: "0.05em",
                  }}
                >
                  —
                </div>
=======
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assigned_to: string | null;
  priority: number;
  posted_by_name: string | null;
  created_at: string;
}

const STATUS_COLS = ["open", "in_progress", "done"] as const;

const STATUS_LABELS: Record<string, string> = {
  open: "OPEN",
  in_progress: "IN PROGRESS",
  done: "DONE",
};

const STATUS_COLORS: Record<string, string> = {
  open: "var(--text-dim)",
  in_progress: "var(--status-working)",
  done: "var(--status-done)",
};

export function TaskBoard({ sessionId }: { sessionId: string }) {
  const { data } = useQuery<{ tasks: Task[] }>({
    queryKey: ["tasks", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/blackboard?action=tasks&session_id=${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const tasks = data?.tasks ?? [];

  return (
    <div className="flex flex-col gap-4">
      {STATUS_COLS.map((status) => {
        const col = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="card p-3">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-mono text-xs font-semibold"
                style={{ color: STATUS_COLORS[status] }}
              >
                {STATUS_LABELS[status]}
              </span>
              <span
                className="font-mono text-xs px-1.5 rounded"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-dim)",
                }}
              >
                {col.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {col.map((task) => (
                <div
                  key={task.id}
                  className="p-2 rounded text-xs"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border)",
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {task.title}
                  </div>
                  {task.assigned_to && (
                    <span
                      className="font-mono"
                      style={{ color: "var(--text-dim)" }}
                    >
                      → {task.assigned_to}
                    </span>
                  )}
                </div>
              ))}
              {col.length === 0 && (
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                  No tasks
                </p>
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
