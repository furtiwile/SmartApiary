import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { BOARD_COLORS } from "../models/Inspection";
import type { InspectionEntry } from "../models/Inspection";

interface HiveDiaryListProps {
  entries: InspectionEntry[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function HiveDiaryList({ entries, isLoading, onDelete }: HiveDiaryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-slate-400 text-sm">
        <div className="animate-spin h-5 w-5 rounded-full border-b-2 border-amber-500" />
        Loading diary…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 py-8 text-center">
        <ClipboardList className="h-8 w-8 text-slate-700 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No inspections logged yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const colorOpt = BOARD_COLORS.find((c) => c.value === entry.boardColor);
        return (
          <li key={entry.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
            {/* Row header */}
            <div className="flex items-center justify-between px-4 py-3">
              <button
                className="flex-1 flex items-center gap-3 text-left"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                {colorOpt && (
                  <span
                    className="h-4 w-4 rounded-full border border-white/10 shrink-0"
                    style={{ backgroundColor: colorOpt.hex }}
                    title={colorOpt.label}
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {new Date(entry.inspectedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.queenSeen ? "👑 Queen seen" : "Queen not seen"}
                    {entry.honeyKg != null ? ` · ${entry.honeyKg} kg honey` : ""}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="ml-auto h-4 w-4 text-slate-600" /> : <ChevronDown className="ml-auto h-4 w-4 text-slate-600" />}
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="ml-3 p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-slate-800 px-4 py-4 grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Frames of honey",  value: entry.framesOfHoney ?? "—" },
                  { label: "Honey kg",          value: entry.honeyKg ?? "—" },
                  { label: "Frames of brood",   value: entry.framesOfBrood ?? "—" },
                  { label: "Queen laying eggs",  value: entry.queenLayingEggs === true ? "Yes" : entry.queenLayingEggs === false ? "No" : "—" },
                  { label: "Board colour",       value: entry.boardColor ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-slate-500">{label}</p>
                    <p className="text-slate-300 font-medium">{String(value)}</p>
                  </div>
                ))}
                {entry.notes && (
                  <div className="col-span-2">
                    <p className="text-slate-500">Notes</p>
                    <p className="text-slate-300 whitespace-pre-wrap">{entry.notes}</p>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
