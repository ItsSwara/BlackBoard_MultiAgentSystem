"use client";
import { useEffect, useState } from "react";

export function SyncStatus() {
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
    </div>
  );
}
