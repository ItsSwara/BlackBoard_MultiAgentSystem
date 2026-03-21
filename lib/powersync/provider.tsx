"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { PowerSyncDatabase } from "@powersync/web";
import { PowerSyncContext } from "@powersync/react";
import { AppSchema } from "./schema";
import { BlackboardConnector } from "./connector";

let db: PowerSyncDatabase | null = null;

function getDatabase(): PowerSyncDatabase {
  if (!db) {
    db = new PowerSyncDatabase({
      schema: AppSchema,
      database: { dbFilename: "blackboard.db" },
    });
  }
  return db;
}

interface PowerSyncProviderProps {
  children: React.ReactNode;
}

export function PowerSyncProvider({ children }: PowerSyncProviderProps) {
  const [database, setDatabase] = useState<PowerSyncDatabase | null>(null);

  useEffect(() => {
    const powersyncUrl = process.env.NEXT_PUBLIC_POWERSYNC_URL;
    if (!powersyncUrl) {
      // PowerSync not configured — skip sync, app still works via API polling
      return;
    }

    const db = getDatabase();
    const connector = new BlackboardConnector();

    db.connect(connector).catch(console.error);
    setDatabase(db);

    return () => {
      db.disconnect().catch(console.error);
    };
  }, []);

  if (!database) {
    return <>{children}</>;
  }

  return (
    <PowerSyncContext.Provider value={database}>
      {children}
    </PowerSyncContext.Provider>
  );
}
