import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from "@powersync/web";

export class BlackboardConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    try {
      const response = await fetch("/api/powersync/token");
      if (!response.ok) return null;
      const { token, powersync_url } = await response.json();
      return { token, endpoint: powersync_url };
    } catch {
      return null;
    }
  }

  async uploadData(_database: AbstractPowerSyncDatabase): Promise<void> {
    // All writes go through the server-side API routes (Mastra agents + /api/blackboard)
    // No client-side writes need to be uploaded
  }
}
