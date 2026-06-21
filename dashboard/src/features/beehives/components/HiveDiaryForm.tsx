import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Check } from "lucide-react";
import { BOARD_COLORS } from "../models/Inspection";
import type { InspectionEntry } from "../models/Inspection";

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

interface HiveDiaryFormProps {
  onSubmit: (data: Omit<InspectionEntry, "id" | "hiveId">) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function HiveDiaryForm({ onSubmit, onCancel, isSubmitting }: HiveDiaryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
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

  const submitHandler = async (data: SchemaType) => {
    await onSubmit(data as unknown as Omit<InspectionEntry, "id" | "hiveId">);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 space-y-4">
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
          onClick={onCancel}
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
  );
}
