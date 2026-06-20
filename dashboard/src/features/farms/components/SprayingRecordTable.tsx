import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SprayingApi } from "../api/sprayingApi";

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
  if (sortField !== currentField) return <span className="opacity-30">↕</span>;
  return <span>{sortDir === "asc" ? "↑" : "↓"}</span>;
}

export function SprayingRecordTable({ parcelId, parcelName }: SprayingRecordTableProps) {
  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ["sprayingRecords", parcelId],
    queryFn: () => SprayingApi.getRecordsByParcel(parcelId),
    enabled: !!parcelId,
  });

  const [sortField, setSortField] = useState<SortField>("executedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isExporting, setIsExporting] = useState(false);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sorted = [...records].sort((a, b) => {
    let cmp = 0;
    if (sortField === "executedAt") cmp = a.executedAt.localeCompare(b.executedAt);
    if (sortField === "pesticideType") cmp = a.pesticideType.localeCompare(b.pesticideType);
    if (sortField === "durationMinutes") cmp = a.durationMinutes - b.durationMinutes;
    return sortDir === "asc" ? cmp : -cmp;
  });

  function handleExportPDF() {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const exportDate = new Date().toLocaleDateString();

      // Title block
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Digital Spraying Record", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Parcel: ${parcelName}`, 14, 30);
      doc.text(`Generated: ${exportDate}`, 14, 36);
      doc.text(`Total records: ${records.length}`, 14, 42);

      // Table
      autoTable(doc, {
        startY: 50,
        head: [["Date & Time", "Pesticide Type", "Duration (h)", "Weather Conditions"]],
        body: sorted.map((r) => [
          formatDate(r.executedAt),
          r.pesticideType,
          (r.durationMinutes / 60).toFixed(1),
          r.weatherConditions ?? "—",
        ]),
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      // Footer
      const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `SmartApiary — Digital Spraying Record — Page ${i} of ${pageCount}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      doc.save(`spraying-record-${parcelName.replace(/\s+/g, "-").toLowerCase()}-${exportDate}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Table header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Spraying Records</h3>
          {!isLoading && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {records.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting || records.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? "Exporting…" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-slate-400 text-sm">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" />
          Loading records…
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
          <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No completed spraying records for this parcel.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-slate-800 select-none"
                  onClick={() => toggleSort("executedAt")}
                >
                  Date & Time <SortIcon currentField="executedAt" sortField={sortField} sortDir={sortDir} />
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-slate-800 select-none"
                  onClick={() => toggleSort("pesticideType")}
                >
                  Pesticide <SortIcon currentField="pesticideType" sortField={sortField} sortDir={sortDir} />
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-slate-800 select-none"
                  onClick={() => toggleSort("durationMinutes")}
                >
                  Duration (h) <SortIcon currentField="durationMinutes" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="px-4 py-3">Weather</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-700">{formatDate(r.executedAt)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                      {r.pesticideType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{(r.durationMinutes / 60).toFixed(1)} h</td>
                  <td className="px-4 py-3 text-slate-500">{r.weatherConditions ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
