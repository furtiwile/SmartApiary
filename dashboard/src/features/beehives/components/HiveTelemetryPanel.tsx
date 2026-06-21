import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TelemetryStatusCards } from "./TelemetryStatusCards";
import { NectarDeltaChart, TemperatureHumidityChart } from "./TelemetryCharts";
import { HiveDiary } from "./HiveDiary";
import { DevicePairingModal } from "./DevicePairingModal";
import { useApiarySignalR } from "../hooks/useApiarySignalR";
import type { TelemetryReading } from "../models/Telemetry";
import type { Beehive } from "../models/Beehive";
import { useApis } from "../../../shared/api/useApis";

interface HiveTelemetryPanelProps {
  hive: Beehive;
}

export function HiveTelemetryPanel({ hive }: HiveTelemetryPanelProps) {
  const queryClient = useQueryClient();
  const { telemetry: telemetryApi } = useApis();

  const [isPaired, setIsPaired] = useState(!!hive.smartScaleId);
  const [isLive, setIsLive] = useState(false);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["telemetry", hive.id],
    queryFn: () => telemetryApi.getByHive(hive.id),
    enabled: isPaired,
  });

  const { onTelemetry, latestReadings } = useApiarySignalR();

  // Subscribe to live updates from the SignalR context
  useEffect(() => {
    const unsub = onTelemetry((reading) => {
      if (reading.hiveId !== hive.id) return;
      setIsLive(true);
      queryClient.setQueryData<TelemetryReading[]>(["telemetry", hive.id], (old) => [
        ...(old || []).slice(-499),
        reading,
      ]);
    });
    return unsub;
  }, [hive.id, onTelemetry, queryClient]);

  const displayLatest = latestReadings[hive.id] || (history.length > 0 ? history[history.length - 1] : null);

  if (!isPaired) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <p className="text-slate-500 text-sm">No SmartScale device paired to this hive.</p>
        <DevicePairingModal
          hiveId={hive.id}
          hiveName={hive.name}
          isPaired={false}
          onPaired={() => { setIsPaired(true); }}
          onUnpaired={() => { setIsPaired(false); queryClient.setQueryData(["telemetry", hive.id], []); }}
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
          onPaired={() => { setIsPaired(true); }}
          onUnpaired={() => { setIsPaired(false); queryClient.setQueryData(["telemetry", hive.id], []); }}
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
