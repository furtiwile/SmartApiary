import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Siren, PlusCircle, X, XCircle, CheckCircle, Clock, AlertTriangle, CalendarRange } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useAuth } from "../../users/hooks/AuthHook";
import type { SprinklingAnnouncementDto, SprinklingStatus } from "../models/Sprinkling";
import type { ParcelDto } from "../models/Parcel";
import { useApis } from "../../../shared/api/useApis";
import { useSignalR } from "../../../shared/signalr/useSignalR";
import { SprayingApi } from "../api/sprayingApi";

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
  scheduledAt: z.string().min(1, "Date and time are required."),
  notes: z.string().optional(),
  bypassWeatherValidation: z.boolean().optional(),
});

type SchemaType = z.infer<typeof schema>;

export function SprayingAnnouncementModal({ parcelId, parcelName }: SprayingAnnouncementModalProps) {
  const [open, setOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [weatherWarning, setWeatherWarning] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SprinklingAnnouncementDto | null>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotify();
  const { user } = useAuth();
  const { geo: geoApi } = useApis();
  const { connection } = useSignalR();

  useEffect(() => {
    if (!connection) return;
  }, [connection, queryClient, parcelId]);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements", parcelId],
    queryFn: () => SprayingApi.getByParcel(parcelId),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: { pesticideType: PESTICIDE_TYPES[0], durationHours: 1, scheduledAt: "", notes: "", bypassWeatherValidation: false },
  });

  function handleStartEdit(ann: SprinklingAnnouncementDto) {
    setEditingAnnouncement(ann);
    setValue("pesticideType", ann.pesticideType);
    setValue("durationHours", ann.durationMinutes / 60);
    
    const localDate = new Date(ann.scheduledAt);
    const offset = localDate.getTimezoneOffset() * 60000;
    const formatted = new Date(localDate.getTime() - offset).toISOString().slice(0, 16);
    setValue("scheduledAt", formatted);
    setValue("bypassWeatherValidation", false);
    setWeatherWarning(null);
  }

  function handleCancelEdit() {
    setEditingAnnouncement(null);
    reset();
    setWeatherWarning(null);
  }

  async function checkWeatherAndSubmit(data: SchemaType) {
    if (new Date(data.scheduledAt) <= new Date()) {
      error("Validation error", "Scheduled time must be in the future.");
      return;
    }

    if (!data.bypassWeatherValidation) {
      try {
        const parcels = queryClient.getQueryData<ParcelDto[]>(["parcels", user?.id]) || [];
        const parcel = parcels.find(p => p.id === parcelId);
        if (parcel) {
          const weather = await geoApi.getWeather(parcel.latitude, parcel.longitude);
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
      if (editingAnnouncement) {
        const ok = await SprayingApi.reschedule({
          parcelId,
          announcementId: editingAnnouncement.id,
          startTime: new Date(data.scheduledAt).toISOString(),
          expectedDurationHours: editingAnnouncement.durationMinutes / 60,
          preparationType: editingAnnouncement.pesticideType,
          bypassWeatherValidation: data.bypassWeatherValidation,
        });

        if (ok) {
          success("Spraying rescheduled", "The announcement has been successfully updated.");
          setEditingAnnouncement(null);
          reset();
          setWeatherWarning(null);
          queryClient.invalidateQueries({ queryKey: ["announcements", parcelId] });
        } else {
          error("Failed to reschedule", "The server returned an error. Please try again.");
        }
      } else {
        const result = await SprayingApi.create({
          parcelId,
          preparationType: data.pesticideType,
          startTime: new Date(data.scheduledAt).toISOString(),
          expectedDurationHours: data.durationHours,
        });

        if (result) {
          const notified = result.beekeepersNotified;
          if (notified > 0) {
            success("Spraying scheduled", `${notified} hive${notified !== 1 ? "s" : ""} in a 5 km radius ${notified === 1 ? "has" : "have"} been notified by email.`, { duration: 8000 });
          } else {
            success("Spraying scheduled", "Spraying scheduled successfully. No nearby hives were affected.", { duration: 8000 });
          }
          
          setOpen(false);
          reset();
          setWeatherWarning(null);
          queryClient.invalidateQueries({ queryKey: ["announcements", parcelId] });
        } else {
          error("Failed to schedule", "The server returned an error. Please try again.");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      error(editingAnnouncement ? "Failed to reschedule" : "Failed to schedule", msg);
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

  const [minDateTime] = useState(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  });

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) { handleCancelEdit(); }
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
                            <p className="text-sm font-medium text-slate-200">
                              {ann.pesticideType}
                              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 border border-slate-600">
                                {ann.beekeepersNotified ?? 0} hives affected
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(ann.scheduledAt).toLocaleString()} · {(ann.durationMinutes / 60).toFixed(1)} h
                            </p>
                          </div>
                        </div>
                        {ann.status === "Scheduled" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEdit(ann)}
                              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              Reschedule
                            </button>
                            <span className="text-slate-700 text-xs">|</span>
                            <button
                              onClick={() => setCancelTarget(ann.id)}
                              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
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