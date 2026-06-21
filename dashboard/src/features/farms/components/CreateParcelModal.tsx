import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusCircle, X, MapPin } from "lucide-react";
import { FarmApi } from "../api/farmApi";
import { useNotify } from "../../../hooks/useNotify";
import type { ParcelDto } from "../models/Parcel";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  latitude: z.coerce.number({ message: "Invalid latitude" }).min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  longitude: z.coerce.number({ message: "Invalid longitude" }).min(-180, "Invalid longitude").max(180, "Invalid longitude"),
});

type SchemaType = z.infer<typeof schema>;

interface CreateParcelModalProps {
  onCreated: (parcel: Omit<ParcelDto, "id" | "farmerId"> & { id?: string }) => void;
  initialLocation?: {lat: number, lng: number} | null;
}

export function CreateParcelModal({ onCreated, initialLocation }: CreateParcelModalProps) {
  const [open, setOpen] = useState(false);
  const { success, error } = useNotify();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: { name: "", latitude: "" as unknown as number, longitude: "" as unknown as number },
  });

  useEffect(() => {
    if (initialLocation) {
      setValue("latitude", initialLocation.lat);
      setValue("longitude", initialLocation.lng);
      setTimeout(() => setOpen(true), 0);
    }
  }, [initialLocation, setValue]);

  async function onSubmit(data: SchemaType) {
    try {
      const result = await FarmApi.createParcel({
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      if (result) {
        success("Parcel created", `"${result.name}" has been added to your farm.`);
        onCreated(result);
        setOpen(false);
        reset();
      } else {
        error("Failed to create parcel", "The server returned an error. Please try again.");
      }
    } catch {
      error("Failed to create parcel", "An unexpected error occurred.");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20">
          <PlusCircle className="h-4 w-4" />
          Add Parcel
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                <MapPin className="h-5 w-5 text-emerald-400" />
              </div>
              <Dialog.Title className="text-lg font-bold text-slate-200">New Parcel</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Parcel Name</label>
              <input
                type="text"
                placeholder="e.g. North Field"
                {...register("name")}
                autoFocus
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              {errors.name && <p className="mt-1.5 text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="45.2500"
                  {...register("latitude")}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
                {errors.latitude && <p className="mt-1.5 text-xs text-rose-400">{errors.latitude.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="19.8420"
                  {...register("longitude")}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
                {errors.longitude && <p className="mt-1.5 text-xs text-rose-400">{errors.longitude.message}</p>}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              The parcel will be plotted on the map at the given coordinates. You can add crops and schedule spraying afterwards.
            </p>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                {isSubmitting ? "Creating…" : "Create Parcel"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
