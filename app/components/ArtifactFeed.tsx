"use client";
<<<<<<< HEAD
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; badgeClass: string }> = {
  finding:    { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)",  badgeClass: "badge-finding" },
  analysis:   { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)", badgeClass: "badge-analysis" },
  draft:      { color: "#f5a623", bg: "rgba(245,166,35,0.1)",  border: "rgba(245,166,35,0.25)",  badgeClass: "badge-draft" },
  final:      { color: "#00e87a", bg: "rgba(0,232,122,0.1)",   border: "rgba(0,232,122,0.25)",   badgeClass: "badge-final" },
  annotation: { color: "#ff4466", bg: "rgba(255,68,102,0.1)",  border: "rgba(255,68,102,0.25)",  badgeClass: "badge-annotation" },
};

const AGENT_COLORS: Record<string, string> = {
  orchestrator: "#00d4ff",
  researcher:   "#60a5fa",
  analyst:      "#a78bfa",
  writer:       "#00e87a",
  human:        "#f5a623",
};

function getAgentColor(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(AGENT_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#8892a4";
}

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  accepted:  { color: "#00e87a", label: "ACCEPTED" },
  rejected:  { color: "#ff4466", label: "REJECTED" },
  escalated: { color: "#f5a623", label: "ESCALATED" },
  pending:   { color: "#4a5568", label: "PENDING" },
};

interface ArtifactFeedProps {
  sessionId: string;
  onReview: (artifact: unknown) => void;
}

function ArtifactCard({
  a,
  index,
  onReview,
}: {
  a: {
    id: string;
    type: string;
    title: string;
    content: string;
    agent_name: string;
    confidence: number;
    status: string;
    requires_human_review: boolean;
    created_at: string;
  };
  index: number;
  onReview: (artifact: unknown) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeCfg = TYPE_CONFIG[a.type] ?? { color: "#8892a4", bg: "rgba(136,146,164,0.1)", border: "rgba(136,146,164,0.2)", badgeClass: "" };
  const statusStyle = STATUS_STYLE[a.status] ?? STATUS_STYLE.pending;
  const agentColor = getAgentColor(a.agent_name);
  const shortContent = a.content.length > 200 ? a.content.slice(0, 200) + "…" : a.content;
  const needsReview = a.requires_human_review && a.status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      style={{
        background: "rgba(13,20,32,0.7)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${needsReview ? "rgba(245,166,35,0.25)" : typeCfg.border}`,
        borderRadius: 12,
        padding: 18,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          borderRadius: "12px 0 0 12px",
          background: typeCfg.color,
          opacity: 0.6,
        }}
      />

      {/* Review needed banner */}
      {needsReview && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 6,
            background: "rgba(245,166,35,0.08)",
            border: "1px solid rgba(245,166,35,0.2)",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--amber)",
              boxShadow: "0 0 6px var(--amber)",
              animation: "pulse-dot 1.5s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "var(--amber)",
            }}
          >
            REVIEW REQUIRED
          </span>
        </div>
      )}

      {/* Top row: type badge + agent + confidence */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Type badge */}
          <span
            className={typeCfg.badgeClass}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "3px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
            }}
          >
            {a.type}
          </span>

          {/* Agent name */}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: agentColor,
              fontWeight: 600,
            }}
          >
            {a.agent_name}
          </span>
        </div>

        {/* Confidence */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: a.confidence > 0.7 ? "var(--emerald)" : a.confidence > 0.4 ? "var(--amber)" : "var(--red)",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "var(--text-dim)",
            }}
          >
            {Math.round(a.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Title */}
      <h4
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 8,
          lineHeight: 1.4,
        }}
      >
        {a.title}
      </h4>

      {/* Content */}
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          marginBottom: 12,
        }}
      >
        {expanded ? a.content : shortContent}
      </p>

      {a.content.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "var(--cyan)",
            background: "none",
            border: "none",
            padding: "2px 0",
            cursor: "pointer",
            width: "auto",
            marginBottom: 12,
            letterSpacing: "0.06em",
          }}
        >
          {expanded ? "▲ COLLAPSE" : "▼ READ MORE"}
        </button>
      )}

      {/* Bottom row: status + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Status */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: statusStyle.color,
          }}
        >
          {statusStyle.label}
        </span>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onReview({ ...a, _action: "accepted" })}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,232,122,0.08)",
              border: "1px solid rgba(0,232,122,0.2)",
              color: "var(--emerald)",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title="Accept"
          >
            ✓
          </button>
          <button
            onClick={() => onReview({ ...a, _action: "rejected" })}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,68,102,0.08)",
              border: "1px solid rgba(255,68,102,0.2)",
              color: "var(--red)",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title="Reject"
          >
            ✗
          </button>
          <button
            onClick={() => onReview(a)}
            style={{
              padding: "0 12px",
              height: 28,
              borderRadius: 6,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: "pointer",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            REVIEW
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ArtifactFeed({ sessionId, onReview }: ArtifactFeedProps) {
  const { data } = useQuery({
    queryKey: ["blackboard", sessionId, "artifacts"],
    queryFn: async () => {
      const res = await fetch(`/api/blackboard?session_id=${sessionId}`);
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
      return res.json();
    },
    refetchInterval: 3000,
  });

<<<<<<< HEAD
  const artifacts: {
    id: string;
    type: string;
    title: string;
    content: string;
    agent_name: string;
    confidence: number;
    status: string;
    requires_human_review: boolean;
    created_at: string;
  }[] = data?.artifacts ?? [];
=======
  const artifacts = data?.artifacts ?? [];
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290

  if (artifacts.length === 0) {
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
            textAlign: "center",
          }}
        >
          Waiting for agents to write artifacts…
        </div>
=======
        className="card flex items-center justify-center py-16"
        style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "monospace" }}
      >
        Waiting for agents to write artifacts…
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <AnimatePresence>
        {artifacts.map((a, i) => (
          <ArtifactCard key={a.id} a={a} index={i} onReview={onReview} />
        ))}
      </AnimatePresence>
    </motion.div>
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
  );
}
