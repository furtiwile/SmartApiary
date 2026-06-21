import { useState } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Siren, PlusCircle, X, XCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { SprayingApi } from "../api/sprayingApi";
import { GeoApi } from "../../maps/api/geoApi";
import { useNotify } from "../../../hooks/useNotify";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useAuth } from "../../users/hooks/AuthHook";
import type { SprinklingStatus } from "../models/Sprinkling";
import type { ParcelDto } from "../models/Parcel";

const PESTICIDE_TYPES = [
  "Herbicide", "Fungicide", "Insecticide", "Rodenticide", "Nematicide", "Other",
];

const STATUS_CONFIG: Record<SprinklingStatus, { label: string; icon: typeof Clock; color: string }> = {
  Scheduled:  { label: "Scheduled",  icon: Clock,         color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  Completed:  { label: "Completed",  icon: CheckCircle,   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  Cancelled:  { label: "Cancelled",  icon: XCircle,       color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  Postponed:  { label: "Postponed",  icon: AlertTriangle, color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
};

interface SprayingAnnouncementModalProps {
  parcelId: string;
  parcelName: string;
}

const schema = z.object({
  pesticideType: z.string().min(1, "Please specify the pesticide."),
  durationHours: z.coerce.number({ message: "Invalid duration" }).min(0.5, "Minimum duration is 0.5 hours."),
  scheduledAt: z.string().min(1, "Date and time are required.").refine(
    (val) => new Date(val) > new Date(),
    { message: "Scheduled time must be in the future." }
  ),
  notes: z.string().optional(),
  bypassWeatherValidation: z.boolean().optional(),
});

type SchemaType = z.infer<typeof schema>;

export function SprayingAnnouncementModal({ parcelId, parcelName }: SprayingAnnouncementModalProps) {
  const [open, setOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [weatherWarning, setWeatherWarning] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { success, error, warning } = useNotify();
  const { user } = useAuth();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements", parcelId],
    queryFn: () => SprayingApi.getByParcel(parcelId),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: { pesticideType: PESTICIDE_TYPES[0], durationHours: 1, scheduledAt: "", notes: "", bypassWeatherValidation: false },
  });

  async function checkWeatherAndSubmit(data: SchemaType) {
    if (!data.bypassWeatherValidation) {
      try {
        const parcels = queryClient.getQueryData<ParcelDto[]>(["parcels", user?.id]) || [];
        const parcel = parcels.find(p => p.id === parcelId);
        if (parcel) {
          const weather = await GeoApi.getWeather(parcel.latitude, parcel.longitude);
          if (weather) {
            if (weather.windSpeed > 5.0) {
              setWeatherWarning("Bad weather conditions - postponing is recommended. Wind speed is too high.");
              return;
            }
            if (weather.precipitation > 0 || weather.description.toLowerCase().includes("rain")) {
              setWeatherWarning("Bad weather conditions - postponing is recommended. Rain detected.");
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to check weather", err);
      }
    }
    await doSubmit(data);
  }

  async function doSubmit(data: SchemaType) {
    try {
      const result = await SprayingApi.create({
        parcelId,
        preparationType: data.pesticideType,
        startTime: data.scheduledAt,
        expectedDurationHours: data.durationHours,
        bypassWeatherValidation: data.bypassWeatherValidation,
      });

      if (result) {
        queryClient.setQueryData<typeof announcements>(["announcements", parcelId], (old) => [result.announcement, ...(old || [])]);
        const notified = result.beekeepersNotified;
        if (notified > 0) {
          success("Spraying scheduled", `${notified} beekeeper${notified !== 1 ? "s" : ""} in a 5 km radius have been notified by email.`, { duration: 8000 });
        } else {
          warning("Spraying scheduled", "No beekeepers are registered within 5 km of this parcel. No emails were sent.", { duration: 8000 });
        }
        setOpen(false);
        reset();
        setWeatherWarning(null);
      } else {
        error("Failed to schedule", "The server returned an error. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      error("Failed to schedule", msg);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    const ok = await SprayingApi.cancel(cancelTarget, parcelId);
    if (ok) {
      queryClient.setQueryData<typeof announcements>(["announcements", parcelId], (old) =>
        old?.map((a) => a.id === cancelTarget ? { ...a, status: "Cancelled" } : a)
      );
      success("Announcement cancelled", "The spraying event has been cancelled.");
    } else {
      error("Cancel failed", "Could not cancel the announcement. Please try again.");
    }
    setCancelTarget(null);
  }

  const [minDateTime] = useState(() =>
    new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)
  );

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) { reset(); setWeatherWarning(null); }
      }}>
        <Dialog.Trigger asChild>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-rose-800/40 bg-rose-500/5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all">
            <Siren className="h-3 w-3" />
            Spraying
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
                  <Siren className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-slate-200">
                    Spraying Announcements
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

            {/* Existing announcements */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Scheduled Events
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2 py-4 text-slate-500 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500" />
                  Loading…
                </div>
              ) : announcements.length === 0 ? (
                <p className="text-sm text-slate-600 py-2">No announcements yet.</p>
              ) : (
                <ul className="space-y-2">
                  {announcements.map((ann) => {
                    const cfg = STATUS_CONFIG[ann.status];
                    const Icon = cfg.icon;
                    return (
                      <li key={ann.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{ann.pesticideType}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(ann.scheduledAt).toLocaleString()} · {(ann.durationMinutes / 60).toFixed(1)} h
                            </p>
                          </div>
                        </div>
                        {ann.status === "Scheduled" && (
                          <button
                            onClick={() => setCancelTarget(ann.id)}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Schedule form */}
            <div className="border-t border-slate-800 pt-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Schedule New Spraying
              </p>
              <form onSubmit={handleSubmit(checkWeatherAndSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Pesticide Type
                    </label>
                    <select
                      {...register("pesticideType")}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                    >
                      {PESTICIDE_TYPES.map((pt) => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      max={24}
                      {...register("durationHours")}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                    />
                    {errors.durationHours && <p className="mt-1.5 text-xs text-rose-400">{errors.durationHours.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    min={minDateTime}
                    {...register("scheduledAt")}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all [color-scheme:dark]"
                  />
                  {errors.scheduledAt && <p className="mt-1.5 text-xs text-rose-400">{errors.scheduledAt.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    placeholder="e.g. Preventive treatment, windy conditions expected"
                    {...register("notes")}
                    rows={2}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all resize-none"
                  />
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
                  ⚠️ All beekeepers within <strong>5 km</strong> of this parcel will receive an email warning. Please schedule at least <strong>24 hours</strong> in advance when possible.
                </div>

                {weatherWarning && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300 flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Weather Warning
                    </div>
                    <p className="text-rose-400 text-xs">{weatherWarning}</p>
                    <label className="flex items-center gap-2 mt-1 text-xs text-slate-400 cursor-pointer">
                      <input type="checkbox" {...register("bypassWeatherValidation")} className="rounded border-slate-600 bg-slate-800 text-rose-500 focus:ring-rose-500/50" />
                      <span>I understand the risks, schedule anyway</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <PlusCircle className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Scheduling…" : "Schedule Spraying"}
                </button>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title="Cancel spraying event?"
        description="The scheduled spraying announcement will be cancelled. Beekeepers will not be re-notified."
        confirmLabel="Cancel Event"
        isDestructive={false}
        onConfirm={handleCancel}
      />
    </>
  );
}
