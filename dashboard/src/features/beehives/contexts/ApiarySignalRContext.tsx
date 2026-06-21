import React, { useRef, useState, useCallback, useEffect } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { createSignalRConnection } from "../../../shared/signalr/signalr";
import { CONFIG } from "../../../config/config";
import { useNotify } from "../../../hooks/useNotify";
import type { TelemetryReading } from "../models/Telemetry";

import { ApiarySRContext } from "./ApiarySRContextDef";

// ─── Provider ───────────────────────────────────────────────────────────────

export function ApiarySignalRProvider({ children }: { children: React.ReactNode }) {
  const connection = useRef(createSignalRConnection(CONFIG.HUB_URL));
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected
  );
  const [latestReadings, setLatestReadings] = useState<Record<string, TelemetryReading>>({});
  const telemetryHandlers = useRef<Set<(r: TelemetryReading) => void>>(new Set());
  const { warning, error: notifyError } = useNotify();

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const conn = connection.current;
    let isMounted = true;

    conn.onreconnecting(() => { if (isMounted) setConnectionState(HubConnectionState.Reconnecting); });
    conn.onreconnected(() => { if (isMounted) setConnectionState(HubConnectionState.Connected); });
    conn.onclose(() => { if (isMounted) setConnectionState(HubConnectionState.Disconnected); });

    // Listen for telemetry readings
    conn.on("ReceiveTelemetry", (reading: TelemetryReading) => {
      if (!isMounted) return;
      setLatestReadings((prev) => ({ ...prev, [reading.hiveId]: reading }));
      telemetryHandlers.current.forEach((h) => h(reading));

      // Surface global alerts via the notification system
      if (reading.isAlert && reading.alertType) {
        const alertMessages: Record<NonNullable<TelemetryReading["alertType"]>, { title: string; message: string }> = {
          Theft:            { title: "🚨 Theft Alert",        message: `Hive "${reading.hiveName ?? reading.hiveId}" has been moved or tilted.` },
          BatteryLow:       { title: "🔋 Low Battery",        message: `Hive "${reading.hiveName ?? reading.hiveId}" battery is at ${reading.batteryPercent}%.` },
          PesticideWarning: { title: "⚠️ Pesticide Warning",  message: `A spraying announcement was issued near hive "${reading.hiveName ?? reading.hiveId}".` },
        };
        const msg = alertMessages[reading.alertType];
        if (msg) warning(msg.title, msg.message, { duration: 10000 });
      }
    });

    // Start connection
    const start = async () => {
      if (!isMounted) return;
      if (conn.state === HubConnectionState.Disconnected) {
        try {
          await conn.start();
          if (isMounted) setConnectionState(HubConnectionState.Connected);
        } catch (err: unknown) {
          if (!isMounted) return;
          console.error("SignalR start error:", err);
          if (err instanceof Error && err.message && err.message.includes("abort")) return; // ignore aborts
          notifyError("Connection error", "Could not connect to real-time hub. Retrying…");
          setTimeout(start, 5000);
        }
      }
    };

    start();

    return () => {
      isMounted = false;
      conn.off("ReceiveTelemetry");
      conn.stop();
    };
  }, [warning, notifyError]);

  // ── Group management ──────────────────────────────────────────────────────

  const joinApiaryGroup = useCallback(async (apiaryId: string) => {
    if (connection.current.state !== HubConnectionState.Connected) return;
    try {
      await connection.current.invoke("JoinApiaryGroup", apiaryId);
    } catch (e) {
      console.error("JoinApiaryGroup error:", e);
    }
  }, []);

  const leaveApiaryGroup = useCallback(async (apiaryId: string) => {
    if (connection.current.state !== HubConnectionState.Connected) return;
    try {
      await connection.current.invoke("LeaveApiaryGroup", apiaryId);
    } catch (e) {
      console.error("LeaveApiaryGroup error:", e);
    }
  }, []);

  // ── Handler subscription ──────────────────────────────────────────────────

  const onTelemetry = useCallback((handler: (r: TelemetryReading) => void) => {
    telemetryHandlers.current.add(handler);
    return () => { telemetryHandlers.current.delete(handler); };
  }, []);

  return (
    <ApiarySRContext.Provider value={{ connectionState, joinApiaryGroup, leaveApiaryGroup, onTelemetry, latestReadings }}>
      {children}
    </ApiarySRContext.Provider>
  );
}


