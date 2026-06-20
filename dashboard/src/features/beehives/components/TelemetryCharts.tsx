import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import type { TelemetryReading } from "../models/Telemetry";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Nectar Gain/Loss Bar Chart ───────────────────────────────────────────────

interface NectarChartProps {
  readings: TelemetryReading[];
}

function buildNectarDeltas(readings: TelemetryReading[]) {
  // Group by date, pick first reading of day (≈08:00) and last (≈20:00)
  const byDate: Record<string, TelemetryReading[]> = {};
  readings.forEach((r) => {
    const date = r.timestamp.slice(0, 10);
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(r);
  });

  return Object.entries(byDate)
    .map(([date, entries]) => {
      const sorted = entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      const morning = sorted[0];
      const evening = sorted[sorted.length - 1];
      const delta = parseFloat((evening.weightKg - morning.weightKg).toFixed(2));
      return { date, delta };
    })
    .slice(-14); // last 14 days
}

export function NectarDeltaChart({ readings }: NectarChartProps) {
  const data = buildNectarDeltas(readings);

  if (data.length === 0) {
    return (
      <ChartSkeleton />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-5">
      <p className="text-sm font-bold text-slate-300 mb-4">Nectar Gain / Loss (kg/day)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(v: unknown) => {
              const val = typeof v === 'number' ? v : 0;
              return [`${val > 0 ? "+" : ""}${val} kg`, "Delta"]
            }}
          />
          <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
          <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.delta >= 0 ? "#10b981" : "#f43f5e"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Temperature Line Chart ───────────────────────────────────────────────────

interface LineChartProps {
  readings: TelemetryReading[];
}

export function TemperatureHumidityChart({ readings }: LineChartProps) {
  const sliced = readings.slice(-48); // last 48 points

  if (sliced.length === 0) {
    return <ChartSkeleton />;
  }

  const data = sliced.map((r) => ({
    time: formatTime(r.timestamp),
    temp: parseFloat(r.temperatureCelsius.toFixed(1)),
    humidity: parseFloat(r.humidityPercent.toFixed(0)),
  }));

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-5">
      <p className="text-sm font-bold text-slate-300 mb-1">Temperature & Humidity</p>
      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs text-rose-400"><span className="h-2 w-4 rounded bg-rose-500 inline-block" />°C</span>
        <span className="flex items-center gap-1.5 text-xs text-sky-400"><span className="h-2 w-4 rounded bg-sky-500 inline-block" />%RH</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Line type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2} dot={false} name="Temp (°C)" />
          <Line type="monotone" dataKey="humidity" stroke="#38bdf8" strokeWidth={2} dot={false} name="Humidity (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Shared skeleton ──────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-5 h-[276px] flex flex-col justify-between animate-pulse">
      <div className="h-4 w-40 bg-slate-800 rounded" />
      <div className="h-[200px] bg-slate-800/50 rounded-xl" />
    </div>
  );
}
