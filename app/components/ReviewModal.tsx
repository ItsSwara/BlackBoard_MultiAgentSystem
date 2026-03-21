"use client";
import { useState } from "react";

interface Artifact {
  id: string;
  title: string;
  content: string;
  type: string;
  agent_name: string;
  confidence: number;
}

interface ReviewModalProps {
  artifact: Artifact;
  onClose: () => void;
  onSubmit: (artifactId: string, status: string, note: string) => Promise<void>;
}

export function ReviewModal({ artifact, onClose, onSubmit }: ReviewModalProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (status: "accepted" | "rejected") => {
    setIsSubmitting(true);
    try {
      await onSubmit(artifact.id, status, note);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", zIndex: 100 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        style={{ border: "1px solid rgba(251,191,36,0.3)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-mono text-sm font-semibold"
            style={{ color: "var(--agent-human)" }}
          >
            ✦ HUMAN REVIEW
          </h2>
          <button
            className="font-mono text-xs"
            style={{ color: "var(--text-dim)", cursor: "pointer" }}
            onClick={onClose}
          >
            ✕ CLOSE
          </button>
        </div>

        <div
          className="p-3 rounded mb-4"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}
        >
          <div className="font-mono text-xs mb-1" style={{ color: "var(--text-dim)" }}>
            {artifact.type.toUpperCase()} · {artifact.agent_name} · {Math.round(artifact.confidence * 100)}% confidence
          </div>
          <h3 className="font-medium text-sm mb-2" style={{ color: "var(--text-primary)" }}>
            {artifact.title}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {artifact.content}
          </p>
        </div>

        <textarea
          className="w-full p-3 text-sm resize-none mb-4"
          rows={3}
          placeholder="Add a note (optional)…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            className="flex-1 py-2 font-mono text-sm rounded font-semibold"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.5 : 1,
            }}
            disabled={isSubmitting}
            onClick={() => handleSubmit("accepted")}
          >
            ✓ Accept
          </button>
          <button
            className="flex-1 py-2 font-mono text-sm rounded font-semibold"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.5 : 1,
            }}
            disabled={isSubmitting}
            onClick={() => handleSubmit("rejected")}
          >
            ✕ Reject
          </button>
        </div>
      </div>
    </div>
  );
}
