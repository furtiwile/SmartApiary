import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, RefreshCw, Search } from "lucide-react";
import { useApis } from "../../../shared/api/useApis";

interface SprayingRecordTableProps {
  parcelId: string;
  parcelName: string;
}

type SortField = "executedAt" | "pesticideType" | "durationMinutes";
type SortDir = "asc" | "desc";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SortIcon({ currentField, sortField, sortDir }: { currentField: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== currentField) return <span className="opacity-20">↕</span>;
  return <span className="text-amber-400">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

export function SprayingRecordTable({ parcelId, parcelName }: SprayingRecordTableProps) {
  const { spraying: sprayingApi } = useApis();

  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ["sprayingRecords", parcelId],
    queryFn: () => sprayingApi.getRecordsByParcel(parcelId),
    enabled: !!parcelId,
  });

  const [sortField, setSortField] = useState<SortField>("executedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterText, setFilterText] = useState("");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter(r =>
      r.pesticideType.toLowerCase().includes(filterText.toLowerCase()) ||
      (r.weatherConditions || "").toLowerCase().includes(filterText.toLowerCase())
    );
  }, [records, filterText]);

  const sorted = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let cmp = 0;
      if (sortField === "executedAt") cmp = a.executedAt.localeCompare(b.executedAt);
      if (sortField === "pesticideType") cmp = a.pesticideType.localeCompare(b.pesticideType);
      if (sortField === "durationMinutes") cmp = a.durationMinutes - b.durationMinutes;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredRecords, sortField, sortDir]);

  const [isExporting, setIsExporting] = useState(false);

  async function handleExportPDF() {
    try {
      setIsExporting(true);
      const blob = await sprayingApi.exportRecordsPdf(parcelId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sprinkling-report-${parcelName}-${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export PDF:", e);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Table header actions */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 shrink">
          <FileText className="h-4 w-4 text-slate-500 shrink-0" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest truncate">Spraying Records</h3>
          {!isLoading && (
            <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs font-medium text-slate-500 shrink-0">
              {filteredRecords.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
            <input
              type="text"
              placeholder="Filter..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-7 pr-2 py-1.5 text-sm w-28 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-slate-800 transition-all shrink-0"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportPDF}
            disabled={records.length === 0 || isExporting}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? "Exporting…" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-slate-500 text-sm">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" />
          Loading records…
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 py-8 text-center">
          <FileText className="h-8 w-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-600">No completed spraying records for this parcel.</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 py-8 text-center">
          <Search className="h-8 w-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-600">No records match your filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-md shadow-sm">
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-slate-900/30">
              <tr>
                <th
                  className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-200 select-none transition-colors"
                  onClick={() => toggleSort("executedAt")}
                >
                  Date & Time <SortIcon currentField="executedAt" sortField={sortField} sortDir={sortDir} />
                </th>
                <th
                  className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-200 select-none transition-colors"
                  onClick={() => toggleSort("pesticideType")}
                >
                  Pesticide <SortIcon currentField="pesticideType" sortField={sortField} sortDir={sortDir} />
                </th>
                <th
                  className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-200 select-none transition-colors"
                  onClick={() => toggleSort("durationMinutes")}
                >
                  Duration (h) <SortIcon currentField="durationMinutes" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Weather</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {sorted.map((r) => (
                <tr key={r.id} className="group hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-slate-300 font-mono">{formatDate(r.executedAt)}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full border border-rose-800/40 bg-rose-500/5 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                      {r.pesticideType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{(r.durationMinutes / 60).toFixed(1)} h</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{r.weatherConditions ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
