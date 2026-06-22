import { useQueryClient } from "@tanstack/react-query";
import { TelemetryStatusCards } from "./TelemetryStatusCards";
import { NectarDeltaChart, TemperatureHumidityChart } from "./TelemetryCharts";
import { HiveDiary } from "./HiveDiary";
import { DevicePairingModal } from "./DevicePairingModal";
import { SmartScaleSettingsModal } from "./SmartScaleSettingsModal";
import { Settings } from "lucide-react";
import { useState } from "react";
import type { Beehive } from "../models/Beehive";
import { useTelemetryData } from "../hooks/useTelemetryData";

interface HiveTelemetryPanelProps {
  hive: Beehive;
}

export function HiveTelemetryPanel({ hive }: HiveTelemetryPanelProps) {
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isRegistered = !!hive.smartScaleId;
  const isActivated = !!hive.smartScaleId && !!hive.isSmartScaleActivated;
  const isRegisteredButNotActivated = isRegistered && !isActivated;

  const { history, isLoading, isLive, displayLatest } = useTelemetryData(hive, isActivated);
  return (
    <div className="space-y-6">
      {!isRegistered ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/30">
          <p className="text-slate-500 text-sm">No SmartScale device paired to this hive.</p>
          <DevicePairingModal
            apiaryId={hive.apiaryId!}
            hiveId={hive.id}
            hiveName={hive.name}
            isPaired={false}
            onPaired={() => { queryClient.invalidateQueries({ queryKey: ["hives"] }); }}
            onUnpaired={() => { queryClient.invalidateQueries({ queryKey: ["hives"] }); queryClient.setQueryData(["telemetry", hive.smartScaleId], []); }}
          />
        </div>
      ) : isRegisteredButNotActivated ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 max-w-xl mx-auto shadow-lg backdrop-blur-sm">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/30 opacity-75"></span>
            <span className="relative h-4 w-4 rounded-full bg-amber-500"></span>
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-300">Device Awaiting Activation</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              SmartScale <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">{hive.smartScaleSerialNumber}</span> is registered to "{hive.name}".
            </p>
            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
              Please power on the device or start the simulator with this serial number to establish the connection.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <DevicePairingModal
              apiaryId={hive.apiaryId!}
              hiveId={hive.id}
              hiveName={hive.name}
              isPaired={true}
              onPaired={() => { queryClient.invalidateQueries({ queryKey: ["hives"] }); }}
              onUnpaired={() => { queryClient.invalidateQueries({ queryKey: ["hives"] }); }}
            />
          </div>
        </div>
      )
        : (
          <div className="space-y-5">
            {/* Pair/unpair action inline */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <DevicePairingModal
                apiaryId={hive.apiaryId!}
                hiveId={hive.id}
                hiveName={hive.name}
                isPaired={true}
                onPaired={() => { queryClient.invalidateQueries({ queryKey: ["hives"] }); }}
                onUnpaired={() => { queryClient.invalidateQueries({ queryKey: ["hives"] }); }}
              />
              <SmartScaleSettingsModal 
                smartScaleId={hive.smartScaleId!}
                serialNumber={hive.smartScaleSerialNumber!}
                isOpen={isSettingsOpen}
                initialThreshold={hive.weightDropThreshold}
                onClose={() => setIsSettingsOpen(false)}
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
          </div>
        )}

      <div className="border-t border-slate-800 pt-6 mt-6">
        <HiveDiary hiveId={hive.id} />
      </div>
    </div>
  );
}
