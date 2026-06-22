import { useState } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusCircle, X, Hexagon } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import type { ApiaryDto } from "../models/Apiary";
import { useApiaries } from "../hooks/useApiaries";

const schema = z.object({
  Name: z.string().min(1, "Apiary name is required."),
  Latitude: z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  Longitude: z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
  Description: z.string().min(1, "Description is required."),
  ImageFile: z.any().refine(
    (files) => files && files.length > 0,
    "An apiary image is required."
  ),
});

type SchemaType = z.infer<typeof schema>;

interface CreateApiaryModalProps {
  onCreated: (apiary: ApiaryDto) => void;
}

export function CreateApiaryModal({ onCreated }: CreateApiaryModalProps) {
  const [open, setOpen] = useState(false);
  const { success, error } = useNotify();
  const { createApiary } = useApiaries();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: { Name: "", Latitude: "" as unknown as number, Longitude: "" as unknown as number, Description: "" },
  });

  async function onSubmit(data: SchemaType) {
    try {
      const result = await createApiary({ 
        Name: data.Name.trim(), 
        Latitude: data.Latitude, 
        Longitude: data.Longitude,
        Description: data.Description.trim(),
        ImageFile: (data.ImageFile as FileList)[0],
      } as unknown as Parameters<typeof createApiary>[0]);
      if (result) {
        success("Apiary created", `"${result.name}" has been added to your account.`);
        onCreated(result);
        setOpen(false);
        reset();
      } else {
        error("Failed to create apiary", "The server returned an error. Please try again.");
      }
    } catch {
      error("Failed to create apiary", "An unexpected error occurred.");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
          <PlusCircle className="h-4 w-4" />
          New Apiary
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                <Hexagon className="h-5 w-5 text-amber-400" />
              </div>
              <Dialog.Title className="text-lg font-bold text-slate-100">New Apiary</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Apiary Name
              </label>
              <input
                type="text"
                placeholder="e.g. Apiary North"
                {...register("Name")}
                autoFocus
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.Name && <p className="mt-1.5 text-xs text-rose-500">{errors.Name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="45.2500"
                  {...register("Latitude")}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.Latitude && <p className="mt-1.5 text-xs text-rose-500">{errors.Latitude.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="19.8420"
                  {...register("Longitude")}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.Longitude && <p className="mt-1.5 text-xs text-rose-500">{errors.Longitude.message}</p>}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              After creating the apiary you can add hives and pair SmartScale devices to them.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
              <textarea
                placeholder="Describe the apiary..."
                {...register("Description")}
                rows={2}
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              {errors.Description && <p className="mt-1.5 text-xs text-rose-500">{errors.Description.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Apiary Image</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                {...register("ImageFile")}
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.ImageFile && <p className="mt-1.5 text-xs text-rose-500">{errors.ImageFile.message as string}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                {isSubmitting ? "Creating…" : "Create Apiary"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}