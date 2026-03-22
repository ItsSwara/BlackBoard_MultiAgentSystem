"use client";
import { useEffect, useState } from "react";

export function SyncStatus() {
<<<<<<< HEAD
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
=======
  const [isOnline, setIsOnline] = useState(true);
  const powersyncUrl = process.env.NEXT_PUBLIC_POWERSYNC_URL;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!powersyncUrl) {
    return (
      <div
        className="font-mono text-xs px-2 py-1 rounded"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--bg-border)",
          color: "var(--text-dim)",
        }}
      >
        DIRECT MODE
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded"
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${isOnline ? "rgba(0,212,170,0.2)" : "rgba(239,68,68,0.2)"}`,
        color: isOnline ? "var(--accent-primary)" : "#ef4444",
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full pulse-dot"
        style={{ background: isOnline ? "var(--accent-primary)" : "#ef4444" }}
      />
      {isOnline ? "SYNCED" : "OFFLINE"}
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
    </div>
  );
}
