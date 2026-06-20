import { Battery, Weight, Thermometer, Droplets, AlertTriangle } from "lucide-react";
import type { TelemetryReading } from "../models/Telemetry";

interface TelemetryStatusCardsProps {
  latest: TelemetryReading | null;
  isLive?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  alert,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border bg-slate-900/80 p-4 flex flex-col gap-2 overflow-hidden ${
      alert ? "border-rose-500/40 shadow-rose-500/10 shadow-lg" : "border-slate-700/60"
    }`}>
      {alert && (
        <span className="absolute top-3 right-3">
          <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
        </span>
      )}
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-slate-100">{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

export function TelemetryStatusCards({ latest, isLive }: TelemetryStatusCardsProps) {
  if (!latest) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["Weight", "Temperature", "Humidity", "Battery"].map((label) => (
          <div key={label} className="rounded-2xl border border-slate-700/60 bg-slate-900/50 p-4 h-28 animate-pulse">
            <div className="h-4 w-16 bg-slate-700 rounded mb-2" />
            <div className="h-6 w-20 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const batteryAlert = latest.batteryPercent <= 15;
  const theftAlert = latest.alertType === "Theft";

  return (
    <div className="space-y-2">
      {isLive && (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400 font-semibold">Live</span>
          <span className="text-xs text-slate-500">
            {new Date(latest.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Weight}
          label="Weight"
          value={latest.weightKg.toFixed(2)}
          unit="kg"
          color="bg-amber-500/10 text-amber-400"
          alert={theftAlert}
        />
        <StatCard
          icon={Thermometer}
          label="Temperature"
          value={latest.temperatureCelsius.toFixed(1)}
          unit="°C"
          color="bg-rose-500/10 text-rose-400"
        />
        <StatCard
          icon={Droplets}
          label="Humidity"
          value={latest.humidityPercent.toFixed(0)}
          unit="%"
          color="bg-sky-500/10 text-sky-400"
        />
        <StatCard
          icon={Battery}
          label="Battery"
          value={latest.batteryPercent.toFixed(0)}
          unit="%"
          color="bg-emerald-500/10 text-emerald-400"
          alert={batteryAlert}
        />
      </div>
    </div>
  );
}
