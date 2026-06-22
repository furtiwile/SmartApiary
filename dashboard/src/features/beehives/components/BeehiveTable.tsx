import { Trash2, Hexagon } from "lucide-react";
import type { Beehive } from "../models/Beehive";
import { EditBeehiveModal } from "./EditBeehiveModal";

interface BeehiveTableProps {
  beehives: Beehive[];
  onDelete: (id: string) => void;
}

export function BeehiveTable({ beehives, onDelete }: BeehiveTableProps) {
  if (beehives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Hexagon className="h-12 w-12 text-slate-700 mb-3" />
        <p className="text-slate-400 font-medium">No hives yet</p>
        <p className="text-sm text-slate-600 mt-1">Use the "Add Hive" button to register your first hive.</p>
      </div>
    );
  }

  return (
    <table className="w-full border-separate border-spacing-0">
      <thead className="bg-slate-50/50 dark:bg-slate-900/30">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
            Designation
          </th>
          <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Type
          </th>
          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
            Super Color
          </th>
          <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Queen Age
          </th>
          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
            Note
          </th>
          <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
        {beehives.map((hive) => (
          <tr
            key={hive.id}
            className="group hover:bg-slate-800/40 transition-colors"
          >
            <td className="px-6 py-4 text-sm font-semibold text-slate-200">
              {hive.designation || hive.name || "Unnamed hive"}
            </td>
            <td className="px-6 py-4 text-center">
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                {hive.type ?? "—"}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-slate-400">
              {hive.superColor || "—"}
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-400">
              {hive.queenAge != null ? `${hive.queenAge} yr` : "—"}
            </td>
            <td className="px-6 py-4 text-sm text-slate-400 max-w-sm truncate">
              {hive.note || "—"}
            </td>
            <td className="px-6 py-4 text-center">
              <EditBeehiveModal hive={hive} apiaryId={hive.apiaryId ?? ""} />
              <button
                onClick={() => onDelete(hive.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-800/40 bg-rose-500/5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
                title="Delete hive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
