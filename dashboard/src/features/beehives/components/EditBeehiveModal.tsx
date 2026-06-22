import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Edit2, X, Hexagon, Save } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import type { Beehive } from "../models/Beehive";
import { useBeehives } from "../hooks/useBeehives";

const schema = z.object({
  designation: z.string().min(1, "Designation is required"),
  type: z.string().min(1, "Type is required"),
  superColor: z.string().min(1, "Super Color is required"),
  queenAge: z.coerce.number().min(1, "Queen age must be at least 1").max(10, "Invalid queen age"),
  note: z.string().optional(),
});

type SchemaType = z.infer<typeof schema>;

interface EditBeehiveModalProps {
  hive: Beehive;
  apiaryId: string;
}

export function EditBeehiveModal({ hive, apiaryId }: EditBeehiveModalProps) {
  const [open, setOpen] = useState(false);
  const { success, error } = useNotify();
  const { updateBeehive } = useBeehives(apiaryId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: {
      designation: hive.designation || hive.name || "",
      type: hive.type || "LR",
      superColor: hive.superColor || "",
      queenAge: hive.queenAge || 1,
      note: hive.note || "",
    },
  });

  // Reset form when opened with latest hive data
  useEffect(() => {
    if (open) {
      reset({
        designation: hive.designation || hive.name || "",
        type: hive.type || "LR",
        superColor: hive.superColor || "",
        queenAge: hive.queenAge || 1,
        note: hive.note || "",
      });
    }
  }, [open, hive, reset]);

  async function onSubmit(data: SchemaType) {
    try {
      const result = await updateBeehive({
        id: hive.id,
        apiaryId,
        designation: data.designation,
        type: data.type,
        superColor: data.superColor,
        queenAge: data.queenAge,
        note: data.note || "",
      });
      if (result) {
        success("Hive updated", `Hive "${result.designation}" has been updated.`);
        setOpen(false);
      } else {
        error("Failed to update hive", "The server returned an error. Please try again.");
      }
    } catch {
      error("Failed to update hive", "An unexpected error occurred.");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all"
          title="Edit hive"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800">
                <Hexagon className="h-5 w-5 text-amber-400" />
              </div>
              <Dialog.Title className="text-lg font-bold text-slate-100">Edit Hive</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Designation</label>
              <input
                type="text"
                placeholder="e.g. Hive Alpha"
                {...register("designation")}
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.designation && <p className="mt-1.5 text-xs text-rose-500">{errors.designation.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                <select
                  {...register("type")}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="LR">Langstroth (LR)</option>
                  <option value="DB">Dadant-Blatt (DB)</option>
                  <option value="Poloska">Poloska</option>
                  <option value="Farrar">Farrar</option>
                  <option value="Other">Other</option>
                </select>
                {errors.type && <p className="mt-1.5 text-xs text-rose-500">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Queen Age</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  {...register("queenAge")}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.queenAge && <p className="mt-1.5 text-xs text-rose-500">{errors.queenAge.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Super Color</label>
              <input
                type="text"
                placeholder="e.g. Yellow"
                {...register("superColor")}
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.superColor && <p className="mt-1.5 text-xs text-rose-500">{errors.superColor.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Note</label>
              <textarea
                placeholder="Optional note..."
                {...register("note")}
                rows={2}
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
