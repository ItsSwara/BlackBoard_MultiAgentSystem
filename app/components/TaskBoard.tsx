"use client";
import { useQuery } from "@tanstack/react-query";

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
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
