"use client";
import { useQuery } from "@tanstack/react-query";

interface Artifact {
  id: string;
  agent_name: string;
  type: string;
  title: string;
  content: string;
  confidence: number;
  status: string;
  requires_human_review: boolean;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  finding: "var(--agent-researcher)",
  analysis: "var(--agent-analyst)",
  draft: "var(--agent-writer)",
  final: "var(--accent-primary)",
  annotation: "var(--agent-human)",
};

const AGENT_COLORS: Record<string, string> = {
  orchestrator: "var(--agent-orchestrator)",
  researcher: "var(--agent-researcher)",
  analyst: "var(--agent-analyst)",
  writer: "var(--agent-writer)",
  human: "var(--agent-human)",
};

export function ArtifactFeed({
  sessionId,
  onReview,
}: {
  sessionId: string;
  onReview: (artifact: Artifact) => void;
}) {
  const { data } = useQuery<{ artifacts: Artifact[] }>({
    queryKey: ["artifacts", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/blackboard?action=artifacts&session_id=${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch artifacts");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const artifacts = data?.artifacts ?? [];

  if (artifacts.length === 0) {
    return (
      <div
        className="card flex items-center justify-center py-16"
        style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "monospace" }}
      >
        Waiting for agents to write artifacts…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {artifacts.map((artifact) => (
        <div
          key={artifact.id}
          className="card p-4"
          style={{
            borderColor: artifact.requires_human_review
              ? "rgba(251,191,36,0.3)"
              : "var(--bg-border)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--bg-elevated)",
                  color: TYPE_COLORS[artifact.type] ?? "var(--text-dim)",
                  border: `1px solid ${TYPE_COLORS[artifact.type] ?? "var(--bg-border)"}22`,
                }}
              >
                {artifact.type.toUpperCase()}
              </span>
              <span
                className="font-mono text-xs"
                style={{ color: AGENT_COLORS[artifact.agent_name] ?? "var(--text-dim)" }}
              >
                {artifact.agent_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs"
                style={{ color: "var(--text-dim)" }}
              >
                {Math.round(artifact.confidence * 100)}%
              </span>
              {artifact.requires_human_review && (
                <button
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(251,191,36,0.1)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    color: "var(--agent-human)",
                    cursor: "pointer",
                  }}
                  onClick={() => onReview(artifact)}
                >
                  REVIEW
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            className="font-medium text-sm mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {artifact.title}
          </h3>

          {/* Content preview */}
          <p
            className="text-xs leading-relaxed"
            style={{
              color: "var(--text-secondary)",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {artifact.content}
          </p>

          {/* Status badge */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className="font-mono text-xs"
              style={{
                color:
                  artifact.status === "accepted"
                    ? "var(--status-done)"
                    : artifact.status === "rejected"
                    ? "#ef4444"
                    : artifact.status === "escalated"
                    ? "var(--agent-human)"
                    : "var(--text-dim)",
              }}
            >
              {artifact.status.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
