"use client";
import { useState } from "react";

<<<<<<< HEAD
interface ReviewModalProps {
  artifact: { id: string; title: string; content: string; type: string };
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
  onClose: () => void;
  onSubmit: (artifactId: string, status: string, note: string) => Promise<void>;
}

<<<<<<< HEAD
const TYPE_COLORS: Record<string, string> = {
  finding: "#60a5fa",
  analysis: "#a78bfa",
  draft: "#f5a623",
  final: "#00e87a",
  annotation: "#ff4466",
};

export function ReviewModal({ artifact, onClose, onSubmit }: ReviewModalProps) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handle = async (status: string) => {
    setSubmitting(true);
    await onSubmit(artifact.id, status, note);
    setSubmitting(false);
    onClose();
  };

  const typeColor = TYPE_COLORS[artifact.type] ?? "#8892a4";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4,8,16,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(13,20,32,0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${typeColor}30`,
          borderRadius: 16,
          padding: 28,
          maxWidth: 580,
          width: "calc(100% - 32px)",
          margin: 16,
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 0 60px rgba(0,0,0,0.6), 0 0 30px ${typeColor}10`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow line matching artifact type */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${typeColor}60, transparent)`,
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Type badge */}
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                padding: "3px 10px",
                borderRadius: 5,
                background: `${typeColor}15`,
                border: `1px solid ${typeColor}35`,
                color: typeColor,
                textTransform: "uppercase",
              }}
            >
              {artifact.type}
            </span>

            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "var(--text-dim)",
                letterSpacing: "0.08em",
              }}
            >
              HUMAN REVIEW
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-dim)",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ×
          </button>
        </div>

        {/* Artifact title */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.4,
            marginBottom: 16,
          }}
        >
          {artifact.title}
        </h2>

        {/* Content */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 10,
            padding: 16,
            maxHeight: 220,
            overflowY: "auto",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
            {artifact.content}
          </p>
        </div>

<<<<<<< HEAD
        {/* Note input */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "var(--text-dim)",
              marginBottom: 8,
            }}
          >
            ANNOTATION NOTE
          </div>
          <textarea
            rows={3}
            placeholder="Add a review note (optional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ resize: "none" }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {/* Accept */}
          <button
            disabled={submitting}
            onClick={() => handle("accepted")}
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              background: "rgba(0,232,122,0.1)",
              border: "1px solid rgba(0,232,122,0.35)",
              color: "var(--emerald)",
              boxShadow: "0 0 20px rgba(0,232,122,0.06)",
              opacity: submitting ? 0.5 : 1,
            }}
          >
            ✓ ACCEPT
          </button>

          {/* Reject */}
          <button
            disabled={submitting}
            onClick={() => handle("rejected")}
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              background: "rgba(255,68,102,0.1)",
              border: "1px solid rgba(255,68,102,0.35)",
              color: "var(--red)",
              boxShadow: "0 0 20px rgba(255,68,102,0.06)",
              opacity: submitting ? 0.5 : 1,
            }}
          >
            ✗ REJECT
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-dim)",
            }}
          >
            ESC
=======
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
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
          </button>
        </div>
      </div>
    </div>
  );
}
