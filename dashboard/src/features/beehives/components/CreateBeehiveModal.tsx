import { useState } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusCircle, X, Hexagon } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import type { Beehive } from "../models/Beehive";
import { useApis } from "../../../shared/api/useApis";

const schema = z.object({
  designation: z.string().min(1, "Designation is required"),
  type: z.string().min(1, "Type is required"),
  superColor: z.string().min(1, "Super Color is required"),
  queenAge: z.coerce.number().min(1, "Queen age must be at least 1").max(10, "Invalid queen age"),
  note: z.string().optional(),
});

type SchemaType = z.infer<typeof schema>;

interface CreateBeehiveModalProps {
  apiaryId: string;
  onCreated: (hive: Beehive) => void;
}

export function CreateBeehiveModal({ apiaryId, onCreated }: CreateBeehiveModalProps) {
  const [open, setOpen] = useState(false);
  const { success, error } = useNotify();
  const { beehives: beehiveApi } = useApis();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: { designation: "", type: "LR", superColor: "", queenAge: 1, note: "" },
  });

  async function onSubmit(data: SchemaType) {
    try {
      const result = await beehiveApi.create({
        ...data,
        apiaryId,
        note: data.note || "",
      });
      if (result) {
        success("Hive created", `Hive "${result.designation}" has been added to the apiary.`);
        onCreated(result);
        setOpen(false);
        reset();
      } else {
        error("Failed to create hive", "The server returned an error. Please try again.");
      }
    } catch {
      error("Failed to create hive", "An unexpected error occurred.");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20">
          <PlusCircle className="h-4 w-4" />
          Add Hive
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                <Hexagon className="h-5 w-5 text-indigo-400" />
              </div>
              <Dialog.Title className="text-lg font-bold text-slate-100">New Hive</Dialog.Title>
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
                autoFocus
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
                {isSubmitting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                {isSubmitting ? "Creating…" : "Create Hive"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
