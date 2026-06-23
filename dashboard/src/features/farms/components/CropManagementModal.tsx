import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Leaf, PlusCircle, Trash2, X, Siren } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import type { CropType } from "../models/Crop";
import { CROP_OPTIONS } from "../models/Crop";
import { useApis } from "../../../shared/api/useApis";

const schema = z.object({
  cropType: z.enum(["Sunflower", "Rapeseed", "Lavender", "Linden", "Acacia", "Other"] as const),
  expectedBloomDate: z.string().min(1, "Please select an expected bloom date."),
  notes: z.string().optional(),
});

type SchemaType = z.infer<typeof schema>;

interface CropManagementModalProps {
  parcelId: string;
  parcelName: string;
}

export function CropManagementModal({ parcelId, parcelName }: CropManagementModalProps) {
  const [open, setOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useNotify();
  const { crops: cropApi } = useApis();

  const { data: crops = [], isLoading } = useQuery({
    queryKey: ["crops", parcelId],
    queryFn: () => cropApi.getByParcel(parcelId),
    enabled: open,
  });

  // Fetch spraying records to show on the crop card ("green card")
  const { spraying: sprayingApi } = useApis();
  const { data: sprayingRecords = [] } = useQuery({
    queryKey: ["spraying-records", parcelId],
    queryFn: () => sprayingApi.getRecordsByParcel(parcelId),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: { cropType: "Other", expectedBloomDate: "", notes: "" },
  });

  const selectedCropType = useWatch({ control, name: "cropType" });

  async function onSubmit(data: SchemaType) {
    try {
      const expectedDate = data.expectedBloomDate;
      const expectedIso = data.expectedBloomDate.includes("T")
        ? new Date(expectedDate).toISOString()
        : `${expectedDate}T00:00:00Z`;

      const result = await cropApi.create({
        parcelId,
        type: data.cropType as CropType,
        expectedFloweringTime: expectedIso,
        note: data.notes || "",
      });
      if (result) {
        queryClient.setQueryData<typeof crops>(["crops", parcelId], (old) => [...(old || []), result]);
        queryClient.invalidateQueries({ queryKey: ["all-crops"] });
        success("Crop added", `${data.cropType} has been assigned to "${parcelName}".`);
        reset();
      } else {
        error("Failed", "Could not add crop. Please try again.");
      }
    } catch {
      error("Failed", "An unexpected error occurred.");
    }
  }

  async function confirmDeleteCrop() {
    if (!confirmDeleteId) return;
    const deleted = await cropApi.delete(confirmDeleteId, parcelId);
    if (deleted) {
      queryClient.setQueryData<typeof crops>(["crops", parcelId], (old) => old?.filter((c) => c.id !== confirmDeleteId));
      queryClient.invalidateQueries({ queryKey: ["all-crops"] });
      success("Crop removed", "The crop has been removed from the parcel.");
    } else {
      error("Failed", "Could not remove crop. Please try again.");
    }
    setConfirmDeleteId(null);
  }

  const todayIso = (() => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split("T")[0];
  })();

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all">
            <Leaf className="h-3 w-3" />
            Crops
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Leaf className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-slate-200">
                    Crop Management
                  </Dialog.Title>
                  <p className="text-xs text-slate-500">{parcelName}</p>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Existing crops list */}
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Current Crops
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2 py-4 text-slate-500 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500" />
                  Loading…
                </div>
              ) : crops.length === 0 ? (
                <p className="text-sm text-slate-600 py-3">No crops assigned yet.</p>
              ) : (
                <ul className="divide-y divide-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {crops.map((crop) => {
                    const opt = CROP_OPTIONS.find((o) => o.value === crop.cropType);
                    return (
                      <li key={crop.id} className="flex items-center justify-between px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{opt?.emoji ?? "🌱"}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{crop.cropType}</p>
                            <p className="text-xs text-slate-500">
                              Bloom: {new Date(crop.expectedBloomDate).toLocaleDateString(undefined, { timeZone: "UTC" })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setConfirmDeleteId(crop.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Spraying History — show what has been applied to this parcel */}
            {sprayingRecords.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Siren className="h-3 w-3 text-rose-400" />
                  Spraying History
                </p>
                <ul className="divide-y divide-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {sprayingRecords.slice(0, 5).map((rec) => (
                    <li
                      key={rec.id}
                      className="flex items-center justify-between px-4 py-2.5 bg-slate-800/50"
                    >
                      <div>
                        <p className="text-xs font-semibold text-rose-400">{rec.pesticideType}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(rec.executedAt).toLocaleDateString()} &middot; {rec.durationMinutes} min
                        </p>
                      </div>
                      {rec.weatherConditions && (
                        <span className="text-xs text-slate-600 italic truncate max-w-[100px]">
                          {rec.weatherConditions}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                {sprayingRecords.length > 5 && (
                  <p className="text-xs text-slate-600 text-center mt-1.5">
                    +{sprayingRecords.length - 5} more records
                  </p>
                )}
              </div>
            )}

            {/* Add crop form */}
            <div className="border-t border-slate-800 pt-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Add Crop
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Crop type selector */}
                <div className="grid grid-cols-3 gap-2">
                  {CROP_OPTIONS.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue("cropType", value)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition-all ${
                        selectedCropType === value
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                          : "border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-400"
                      }`}
                    >
                      <span className="text-xl">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Expected Bloom Date
                    </label>
                    <input
                      type="date"
                      min={todayIso}
                      {...register("expectedBloomDate")}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all [color-scheme:dark]"
                    />
                    {errors.expectedBloomDate && <p className="mt-1.5 text-xs text-rose-400">{errors.expectedBloomDate.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Early variety"
                      {...register("notes")}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <PlusCircle className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Adding…" : "Add Crop"}
                </button>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Remove crop?"
        description="This crop will be permanently removed from the parcel. This cannot be undone."
        confirmLabel="Remove Crop"
        onConfirm={confirmDeleteCrop}
      />
    </>
  );
}
