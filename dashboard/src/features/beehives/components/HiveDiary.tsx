import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, PlusCircle, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { InspectionApi } from "../api/telemetryApi";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useNotify } from "../../../hooks/useNotify";
import type { InspectionEntry } from "../models/Inspection";
import { BOARD_COLORS } from "../models/Inspection";

interface HiveDiaryProps {
  hiveId: string;
  hiveName: string;
}

const todayIso = () => new Date().toISOString().slice(0, 16);

const schema = z.object({
  inspectedAt: z.string().min(1, "Date is required."),
  boardColor: z.string().optional(),
  framesOfHoney: z.coerce.number().min(0).optional(),
  honeyKg: z.coerce.number().min(0).optional(),
  framesOfBrood: z.coerce.number().min(0).optional(),
  queenSeen: z.boolean(),
  queenLayingEggs: z.boolean().optional(),
  notes: z.string().optional(),
});

type SchemaType = z.infer<typeof schema>;

export function HiveDiary({ hiveId, hiveName }: HiveDiaryProps) {
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["inspections", hiveId],
    queryFn: () =>
      InspectionApi.getByHive(hiveId).then((data) =>
        data.sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt))
      ),
    enabled: !!hiveId,
  });

  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { success, error } = useNotify();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: {
      inspectedAt: todayIso(),
      boardColor: undefined,
      framesOfHoney: "" as unknown as number,
      honeyKg: "" as unknown as number,
      framesOfBrood: "" as unknown as number,
      queenSeen: false,
      queenLayingEggs: false,
      notes: "",
    },
  });

  const watchBoardColor = useWatch({ control, name: "boardColor" });
  const watchQueenSeen = useWatch({ control, name: "queenSeen" });
  const watchQueenLayingEggs = useWatch({ control, name: "queenLayingEggs" });

  async function onSubmit(data: SchemaType) {
    try {
      const result = await InspectionApi.create({ ...data, hiveId });
      if (result) {
        queryClient.setQueryData<InspectionEntry[]>(["inspections", hiveId], (old) => [
          result,
          ...(old || []),
        ]);
        success("Inspection logged", `Entry added to the diary of "${hiveName}".`);
        reset();
        setShowForm(false);
      } else {
        error("Save failed", "Could not save the inspection. Please try again.");
      }
    } catch {
      error("Save failed", "An unexpected error occurred.");
    }
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    const ok = await InspectionApi.delete(confirmDeleteId);
    if (ok) {
      queryClient.setQueryData<InspectionEntry[]>(["inspections", hiveId], (old) =>
        old?.filter((e) => e.id !== confirmDeleteId)
      );
      success("Entry removed", "The inspection entry has been deleted.");
    } else {
      error("Delete failed", "Could not remove the entry. Please try again.");
    }
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-200">Hive Diary</h3>
          {!isLoading && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
              {entries.length} entries
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-400 transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Log Inspection
        </button>
      </div>

      {/* Add inspection form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Inspection</p>

          {/* Date/time */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              {...register("inspectedAt")}
              className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {errors.inspectedAt && <p className="mt-1.5 text-xs text-rose-500">{errors.inspectedAt.message}</p>}
          </div>

          {/* Board colour */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Board Color (pollen load)</label>
            <div className="flex flex-wrap gap-2">
              {BOARD_COLORS.map(({ value, hex }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("boardColor", watchBoardColor === value ? undefined : value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                    watchBoardColor === value
                      ? "border-amber-500 bg-amber-500/10 text-amber-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: hex }} />
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric fields */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "framesOfHoney" as const, label: "Honey Frames" },
              { key: "honeyKg"       as const, label: "Honey (kg)"  },
              { key: "framesOfBrood" as const, label: "Brood Frames"},
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-slate-500 mb-1">{label}</label>
                <input
                  type="number"
                  min={0}
                  step={key === "honeyKg" ? "0.1" : "1"}
                  {...register(key)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            ))}
          </div>

          {/* Queen checkboxes */}
          <div className="flex items-center gap-6">
            {[
              { key: "queenSeen"        as const, label: "Queen seen" },
              { key: "queenLayingEggs"  as const, label: "Queen laying eggs" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setValue(key, key === "queenSeen" ? !watchQueenSeen : !watchQueenLayingEggs)}
                  className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                    (key === "queenSeen" ? watchQueenSeen : watchQueenLayingEggs)
                      ? "bg-amber-500 border-amber-500 text-slate-900"
                      : "bg-slate-900 border-slate-700"
                  }`}
                >
                  {(key === "queenSeen" ? watchQueenSeen : watchQueenLayingEggs) && <Check className="h-3 w-3" />}
                </button>
                <span className="text-xs text-slate-400">{label}</span>
              </label>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Observations, treatments applied, etc."
              {...register("notes")}
              className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? <span className="h-4 w-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              {isSubmitting ? "Saving…" : "Save Entry"}
            </button>
          </div>
        </form>
      )}

      {/* Entries timeline */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-slate-400 text-sm">
          <div className="animate-spin h-5 w-5 rounded-full border-b-2 border-amber-500" />
          Loading diary…
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 py-8 text-center">
          <ClipboardList className="h-8 w-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No inspections logged yet.</p>
        </div>
      ) : (
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
                    onClick={() => setConfirmDeleteId(entry.id)}
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
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Delete inspection entry?"
        description="This entry will be permanently removed from the hive diary."
        confirmLabel="Delete Entry"
        onConfirm={handleDelete}
      />
    </div>
  );
}
