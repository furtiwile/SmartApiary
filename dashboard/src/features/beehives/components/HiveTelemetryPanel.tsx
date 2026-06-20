import { useEffect, useState } from "react";
import { TelemetryApi } from "../api/telemetryApi";
import { TelemetryStatusCards } from "./TelemetryStatusCards";
import { NectarDeltaChart, TemperatureHumidityChart } from "./TelemetryCharts";
import { HiveDiary } from "./HiveDiary";
import { DevicePairingModal } from "./DevicePairingModal";
import { useApiarySignalR } from "../contexts/ApiarySignalRContext";
import type { TelemetryReading } from "../models/Telemetry";
import type { Beehive } from "../models/Beehive";

interface HiveTelemetryPanelProps {
  hive: Beehive;
}

export function HiveTelemetryPanel({ hive }: HiveTelemetryPanelProps) {
  const [history, setHistory] = useState<TelemetryReading[]>([]);
  const [latest, setLatest] = useState<TelemetryReading | null>(null);
  const [isLoading, setIsLoading] = useState(!!hive.smartScaleId);
  const [isPaired, setIsPaired] = useState(!!hive.smartScaleId);
  const [isLive, setIsLive] = useState(false);

  const { onTelemetry, latestReadings } = useApiarySignalR();

  // Load historical data
  useEffect(() => {
    if (!isPaired) return;
    TelemetryApi.getByHive(hive.id).then((data) => {
      setHistory(data);
      if (data.length > 0) setLatest(data[data.length - 1]);
    }).finally(() => setIsLoading(false));
  }, [hive.id, isPaired]);

  // Subscribe to live updates from the SignalR context
  useEffect(() => {
    const unsub = onTelemetry((reading) => {
      if (reading.hiveId !== hive.id) return;
      setIsLive(true);
      setLatest(reading);
      setHistory((prev) => [...prev.slice(-499), reading]); // keep last 500 points
    });
    return unsub;
  }, [hive.id, onTelemetry]);

  const displayLatest = latest || latestReadings[hive.id];

  if (!isPaired) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <p className="text-slate-500 text-sm">No SmartScale device paired to this hive.</p>
        <DevicePairingModal
          hiveId={hive.id}
          hiveName={hive.name}
          isPaired={false}
          onPaired={() => { setIsPaired(true); setIsLoading(true); }}
          onUnpaired={() => { setIsPaired(false); setLatest(null); setHistory([]); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Pair/unpair action inline */}
      <div className="flex justify-end">
        <DevicePairingModal
          hiveId={hive.id}
          hiveName={hive.name}
          isPaired={isPaired}
          onPaired={() => { setIsPaired(true); setIsLoading(true); }}
          onUnpaired={() => { setIsPaired(false); setLatest(null); setHistory([]); }}
        />
      </div>

      {/* Status cards */}
      {isLoading ? (
        <TelemetryStatusCards latest={null} />
      ) : (
        <TelemetryStatusCards latest={displayLatest} isLive={isLive} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NectarDeltaChart readings={history} />
        <TemperatureHumidityChart readings={history} />
      </div>

      {/* Hive Diary */}
      <HiveDiary hiveId={hive.id} hiveName={hive.name} />
    </div>
  );
}
