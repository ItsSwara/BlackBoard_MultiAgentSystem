"use client";
import { useState } from "react";

interface ReviewModalProps {
  artifact: { id: string; title: string; content: string; type: string };
  onClose: () => void;
  onSubmit: (artifactId: string, status: string, note: string) => Promise<void>;
}

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
            {artifact.content}
          </p>
        </div>

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
          </button>
        </div>
      </div>
    </div>
  );
}
