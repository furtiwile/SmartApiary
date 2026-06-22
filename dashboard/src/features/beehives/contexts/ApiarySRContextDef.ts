import { createContext } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import type { TelemetryReading } from "../models/Telemetry";

export interface ApiarySRContextValue {
  connectionState: HubConnectionState;
  /** Join the SignalR group for a specific apiary to receive its telemetry */
  joinApiaryGroup: (apiaryId: string) => Promise<void>;
  /** Leave a previously joined apiary group */
  leaveApiaryGroup: (apiaryId: string) => Promise<void>;
  /** Join the global Beekeeper group for real-time alerts */
  joinBeekeeperGroup: (beekeeperId: string) => Promise<void>;
  /** Leave the global Beekeeper group */
  leaveBeekeeperGroup: (beekeeperId: string) => Promise<void>;
  /** Subscribe to incoming telemetry readings from the current group */
  onTelemetry: (handler: (reading: TelemetryReading) => void) => () => void;
  /** Latest reading per hiveId (live-updated state) */
  latestReadings: Record<string, TelemetryReading>;
}

export const ApiarySRContext = createContext<ApiarySRContextValue | null>(null);
