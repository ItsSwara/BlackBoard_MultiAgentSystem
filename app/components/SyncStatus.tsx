"use client";
import { useEffect, useState } from "react";

export function SyncStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 12px",
        borderRadius: 6,
        background: online ? "rgba(0,232,122,0.06)" : "rgba(255,68,102,0.06)",
        border: `1px solid ${online ? "rgba(0,232,122,0.2)" : "rgba(255,68,102,0.2)"}`,
      }}
    >
      {/* Dot */}
      <div style={{ position: "relative", width: 7, height: 7, flexShrink: 0 }}>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: online ? "var(--emerald)" : "var(--red)",
            boxShadow: online ? "0 0 8px var(--emerald)" : "0 0 8px var(--red)",
            animation: online ? "pulse-dot 2s ease-in-out infinite" : "none",
          }}
        />
        {online && (
          <div
            style={{
              position: "absolute",
              inset: -3,
              borderRadius: "50%",
              border: "1px solid var(--emerald)",
              opacity: 0,
              animation: "pulse-ring 2s ease-out infinite",
            }}
          />
        )}
      </div>

      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: online ? "var(--emerald)" : "var(--red)",
        }}
      >
        {online ? "LIVE" : "OFFLINE"}
      </span>
    </div>
  );
}
