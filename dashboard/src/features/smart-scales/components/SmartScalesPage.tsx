import { useEffect, useState } from "react";
import { Plus, Copy, Check, Scale } from "lucide-react";
import { smartScalesApi } from "../api/smartScalesApi";
import type { SmartScale } from "../types";

export function SmartScalesPage() {
  const [scales, setScales] = useState<SmartScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchScales = async () => {
    try {
      setLoading(true);
      const data = await smartScalesApi.getUnpaired();
      setScales(data);
    } catch (error) {
      console.error("Failed to fetch smart scales", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await smartScalesApi.create();
      await fetchScales();
    } catch (error) {
      console.error("Failed to create smart scale", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (id: string, serialNumber: string) => {
    try {
      await navigator.clipboard.writeText(serialNumber);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <Scale className="h-8 w-8 text-amber-500" />
            Smart Scales Pool
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Generate and manage available (unpaired) smart scales. Copy a serial number from this pool to register it to one of your hives.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
        >
          {generating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Generate New Scale
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
        {scales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Scale className="h-16 w-16 text-slate-800 mb-4" />
            <p className="text-lg text-slate-300 font-medium">No unpaired scales available</p>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              Generate a new smart scale to add it to the pool. You can then copy its serial number and pair it to a hive.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-slate-800/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Serial Number
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scales.map((scale) => (
                  <tr
                    key={scale.id}
                    className="group hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-amber-500/90">
                      {scale.serialNumber}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                        {scale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCopy(scale.id, scale.serialNumber)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                          copiedId === scale.id
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : "border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {copiedId === scale.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy S/N
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
