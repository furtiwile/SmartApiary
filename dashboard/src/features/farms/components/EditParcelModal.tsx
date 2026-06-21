import { useEffect } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X, MapPin, Save } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import type { ParcelDto } from "../models/Parcel";
import { useApis } from "../../../shared/api/useApis";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  latitude: z.coerce
    .number({ message: "Invalid latitude" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce
    .number({ message: "Invalid longitude" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

type SchemaType = z.infer<typeof schema>;

interface EditParcelModalProps {
  parcel: ParcelDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the updated parcel on success so the parent can update its cache */
  onUpdated: (updated: ParcelDto) => void;
}

/**
 * EditParcelModal
 *
 * Responsibility: Allow the farmer to edit the name, latitude, and longitude
 * of an existing parcel. Follows SRP — this component owns only edit logic.
 * The parent (FarmsPage) owns the list/selection state.
 */
export function EditParcelModal({ parcel, open, onOpenChange, onUpdated }: EditParcelModalProps) {
  const { success, error } = useNotify();
  const { farms: farmApi } = useApis();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: {
      name: parcel.name,
      latitude: parcel.latitude,
      longitude: parcel.longitude,
    },
  });

  // Sync form values when the parcel prop changes (e.g. user selects a different parcel)
  useEffect(() => {
    reset({
      name: parcel.name,
      latitude: parcel.latitude,
      longitude: parcel.longitude,
    });
  }, [parcel.id, parcel.name, parcel.latitude, parcel.longitude, reset]);

  async function onSubmit(data: SchemaType) {
    const updated: ParcelDto = {
      ...parcel,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    const result = await farmApi.updateParcel(updated);

    if (result) {
      success("Parcel updated", `"${data.name}" has been successfully updated.`);
      onUpdated(result);
      onOpenChange(false);
    } else {
      error("Update failed", "Could not update the parcel. Please try again.");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10">
                <MapPin className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-200">Edit Parcel</Dialog.Title>
                <p className="text-xs text-slate-500">Update name or location</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Parcel Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Parcel Name
              </label>
              <input
                type="text"
                {...register("name")}
                autoFocus
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
              />
              {errors.name && <p className="mt-1.5 text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("latitude")}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                />
                {errors.latitude && <p className="mt-1.5 text-xs text-rose-400">{errors.latitude.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("longitude")}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                />
                {errors.longitude && <p className="mt-1.5 text-xs text-rose-400">{errors.longitude.message}</p>}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Changing coordinates will move the parcel marker on the map.
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
