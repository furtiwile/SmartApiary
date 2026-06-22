import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApis } from "../../../shared/api/useApis";
import { useEffect, useState, useMemo } from "react";
import { useApiarySignalR } from "./useApiarySignalR";
import type { TelemetryReading } from "../models/Telemetry";
import type { Beehive } from "../models/Beehive";

export function useTelemetryData(hive: Beehive, isPaired: boolean) {
  const { telemetry: telemetryApi } = useApis();
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false);
  const { onTelemetry, latestReadings } = useApiarySignalR();

  const queryKey = useMemo(() => ["telemetry", hive.smartScaleId], [hive.smartScaleId]);

  const { data: history = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => telemetryApi.getBySmartScale(hive.smartScaleId!),
    enabled: isPaired && !!hive.smartScaleId,
  });

  // Subscribe to live updates from the SignalR context
  useEffect(() => {
    const unsub = onTelemetry((reading) => {
      if (reading.hiveId !== hive.id) return;
      setIsLive(true);
      queryClient.invalidateQueries({ queryKey: ["hives"] });
      if (hive.smartScaleId) {
        queryClient.setQueryData<TelemetryReading[]>(queryKey, (old) => [
          ...(old || []).slice(-499),
          reading,
        ]);
      }
    });
    return unsub;
  }, [hive.id, hive.smartScaleId, onTelemetry, queryClient, queryKey]);

  const displayLatest = latestReadings[hive.id] || (history.length > 0 ? history[history.length - 1] : null);

  return {
    history,
    isLoading,
    isLive,
    displayLatest,
  };
}
