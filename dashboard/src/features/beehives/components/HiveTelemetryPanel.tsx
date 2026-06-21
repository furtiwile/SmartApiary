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
    queryKey: ["telemetry", hive.smartScaleId],
    queryFn: () => telemetryApi.getBySmartScale(hive.smartScaleId!),
    enabled: isPaired && !!hive.smartScaleId,
  });

  const { onTelemetry, latestReadings } = useApiarySignalR();

  // Subscribe to live updates from the SignalR context
  useEffect(() => {
    const unsub = onTelemetry((reading) => {
      if (reading.hiveId !== hive.id) return;
      setIsLive(true);
      if (hive.smartScaleId) {
        queryClient.setQueryData<TelemetryReading[]>(["telemetry", hive.smartScaleId], (old) => [
          ...(old || []).slice(-499),
          reading,
        ]);
      }
    });
    return unsub;
  }, [hive.id, hive.smartScaleId, onTelemetry, queryClient]);

  const displayLatest = latestReadings[hive.id] || (history.length > 0 ? history[history.length - 1] : null);

  if (!isPaired) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <p className="text-slate-500 text-sm">No SmartScale device paired to this hive.</p>
        <DevicePairingModal
          apiaryId={hive.apiaryId!}
          hiveId={hive.id}
          hiveName={hive.name}
          isPaired={false}
          onPaired={() => { setIsPaired(true); queryClient.invalidateQueries({ queryKey: ["beehives"] }); }}
          onUnpaired={() => { setIsPaired(false); queryClient.setQueryData(["telemetry", hive.smartScaleId], []); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Pair/unpair action inline */}
      <div className="flex justify-end">
        <DevicePairingModal
          apiaryId={hive.apiaryId!}
          hiveId={hive.id}
          hiveName={hive.name}
          isPaired={isPaired}
          onPaired={() => { setIsPaired(true); queryClient.invalidateQueries({ queryKey: ["beehives"] }); }}
          onUnpaired={() => { setIsPaired(false); queryClient.setQueryData(["telemetry", hive.smartScaleId], []); }}
        />
      </div>

      {/* Status cards */}
      {isLoading ? (
        <>
          <TelemetryStatusCards latest={null} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <NectarDeltaChart readings={[]} />
            <TemperatureHumidityChart readings={[]} />
          </div>
        </>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 mb-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-20"></span>
            <span className="relative h-4 w-4 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-sm font-bold text-slate-300">Awaiting Telemetry</p>
          <p className="text-xs text-slate-500 max-w-md">
            The smart scale is paired successfully. It will appear here as soon as the hardware transmits its first telemetry packet.
          </p>
        </div>
      ) : (
        <>
          <TelemetryStatusCards latest={displayLatest} isLive={isLive} />
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <NectarDeltaChart readings={history} />
            <TemperatureHumidityChart readings={history} />
          </div>
        </>
      )}

      {/* Hive Diary */}
      <HiveDiary hiveId={hive.id} hiveName={hive.name} />
    </div>
  );
}
