import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Siren,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import { useAuth } from "../../users/hooks/AuthHook";
import { useNotify } from "../../../hooks/useNotify";
import { useApis } from "../../../shared/api/useApis";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import type { SprinklingStatus } from "../models/Sprinkling";
import type { ParcelDto } from "../models/Parcel";

// ─── Constants ────────────────────────────────────────────────────────────────



const STATUS_CONFIG: Record<SprinklingStatus, { label: string; icon: typeof Clock; color: string }> =
  {
    Scheduled: {
      label: "Scheduled",
      icon: Clock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    Completed: {
      label: "Completed",
      icon: CheckCircle,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    Cancelled: {
      label: "Cancelled",
      icon: XCircle,
      color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    },
    Postponed: {
      label: "Postponed",
      icon: AlertTriangle,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    },
  };

// ─── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  pesticideType: z.string().optional(),
  durationHours: z.coerce
    .number({ message: "Invalid duration" })
    .min(0.5, "Minimum duration is 0.5 hours."),
  scheduledAt: z
    .string()
    .min(1, "Date and time are required.")
    .refine((val) => new Date(val) > new Date(), {
      message: "Scheduled time must be in the future.",
    }),
  notes: z.string().optional(),
  bypassWeatherValidation: z.boolean().optional(),
});

type SchemaType = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SprayingPage
 *
 * Responsibility: Dedicated page for farmers to schedule and manage spraying
 * announcements across all their parcels. The user first selects a parcel from
 * the left column, then schedules or reviews announcements in the right column.
 *
 * Follows SRP — this page owns only the spraying workflow. Parcel CRUD lives in FarmsPage.
 */
export const SprayingPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error, warning } = useNotify();
  const { farms: farmApi, spraying: sprayingApi, geo: geoApi } = useApis();

  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [weatherWarning, setWeatherWarning] = useState<string | null>(null);

  // ── Fetch parcels ──────────────────────────────────────────────────────────
  const { data: parcels = [], isLoading: parcelsLoading } = useQuery({
    queryKey: ["parcels", user?.id],
    queryFn: () => (user?.id ? farmApi.getParcelsByFarmer(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  // ── Fetch announcements for selected parcel ────────────────────────────────
  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ["announcements", selectedParcel?.id],
    queryFn: () => sprayingApi.getByParcel(selectedParcel!.id),
    enabled: !!selectedParcel?.id,
  });

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as unknown as Resolver<SchemaType>,
    defaultValues: {
      pesticideType: "",
      durationHours: 1,
      scheduledAt: "",
      notes: "",
      bypassWeatherValidation: false,
    },
  });

  const [minDateTime] = useState(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  });

  // ── Weather check + submit ────────────────────────────────────────────────
  async function checkWeatherAndSubmit(data: SchemaType) {
    if (!data.bypassWeatherValidation && selectedParcel) {
      try {
        const weather = await geoApi.getWeather(selectedParcel.latitude, selectedParcel.longitude);
        if (weather) {
          if (weather.windSpeed > 5.0) {
            setWeatherWarning(
              "Bad weather conditions — postponing is recommended. Wind speed is too high."
            );
            return;
          }
          if (weather.precipitation > 0 || weather.description.toLowerCase().includes("rain")) {
            setWeatherWarning("Bad weather conditions — postponing is recommended. Rain detected.");
            return;
          }
        }
      } catch {
        console.warn("Could not check weather, proceeding anyway.");
      }
    }
    await doSubmit(data);
  }

  async function doSubmit(data: SchemaType) {
    if (!selectedParcel) return;

    try {
      const result = await sprayingApi.create({
        parcelId: selectedParcel.id,
        preparationType: data.pesticideType || "",
        startTime: new Date(data.scheduledAt).toISOString(),
        expectedDurationHours: data.durationHours,
        bypassWeatherValidation: data.bypassWeatherValidation,
      });

      if (result) {
        queryClient.setQueryData<typeof announcements>(
          ["announcements", selectedParcel.id],
          (old) => [result.announcement, ...(old ?? [])]
        );
        const notified = result.beekeepersNotified;
        if (notified > 0) {
          success(
            "Spraying scheduled",
            `${notified} beekeeper${notified !== 1 ? "s" : ""} within 5 km have been notified by email.`,
            { duration: 8000 }
          );
        } else {
          warning(
            "Spraying scheduled",
            "No beekeepers are registered within 5 km of this parcel. No emails were sent.",
            { duration: 8000 }
          );
        }
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
    if (!cancelTarget || !selectedParcel) return;
    const ok = await sprayingApi.cancel(cancelTarget, selectedParcel.id);
    if (ok) {
      queryClient.setQueryData<typeof announcements>(
        ["announcements", selectedParcel.id],
        (old) => old?.map((a) => (a.id === cancelTarget ? { ...a, status: "Cancelled" } : a))
      );
      success("Announcement cancelled", "The spraying event has been cancelled.");
    } else {
      error("Cancel failed", "Could not cancel the announcement. Please try again.");
    }
    setCancelTarget(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
            <Siren className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Spraying</h1>
            <p className="text-slate-400 text-sm">
              Select a parcel, schedule announcements, and notify nearby beekeepers.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left: Parcel selector ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-md overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/60 bg-slate-900/30">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Your Parcels
                </p>
              </div>

              {parcelsLoading ? (
                <div className="flex items-center justify-center gap-3 py-12">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500" />
                  <span className="text-slate-400 text-sm">Loading parcels…</span>
                </div>
              ) : parcels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <MapPin className="h-10 w-10 text-slate-700 mb-3" />
                  <p className="text-slate-400 font-medium">No parcels found</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Add parcels first from the Fields page.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-700/60">
                  {parcels.map((parcel) => {
                    const isSelected = selectedParcel?.id === parcel.id;
                    return (
                      <li key={parcel.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParcel(parcel);
                            reset();
                            setWeatherWarning(null);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                            isSelected
                              ? "bg-rose-500/5 text-rose-300"
                              : "hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                              isSelected ? "bg-rose-500/15" : "bg-slate-700/60"
                            }`}
                          >
                            <MapPin
                              className={`h-4 w-4 ${isSelected ? "text-rose-400" : "text-slate-500"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{parcel.name}</p>
                            <p className="text-xs font-mono text-slate-500 truncate">
                              {parcel.latitude.toFixed(4)}, {parcel.longitude.toFixed(4)}
                            </p>
                          </div>
                          {isSelected && (
                            <ChevronRight className="h-4 w-4 text-rose-400 flex-shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ── Right: Announcement panel ── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {!selectedParcel ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-2xl border border-dashed border-slate-700 bg-slate-900/20 text-center px-8"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 mb-4">
                    <Siren className="h-7 w-7 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-semibold">No parcel selected</p>
                  <p className="text-sm text-slate-600 mt-1 max-w-xs">
                    Select a parcel from the list to view announcements and schedule a new spraying
                    event.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedParcel.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Announcements list */}
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-700/60 bg-slate-900/30 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Announcements for{" "}
                        <span className="text-slate-200">{selectedParcel.name}</span>
                      </p>
                      {announcements.filter((a) => a.status === "Scheduled").length > 0 && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                          {announcements.filter((a) => a.status === "Scheduled").length} pending
                        </span>
                      )}
                    </div>

                    {announcementsLoading ? (
                      <div className="flex items-center gap-2 py-6 px-5 text-slate-500 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500" />
                        Loading…
                      </div>
                    ) : announcements.length === 0 ? (
                      <p className="text-sm text-slate-600 py-6 px-5">
                        No spraying announcements yet for this parcel.
                      </p>
                    ) : (
                      <ul className="divide-y divide-slate-700/60">
                        {announcements.map((ann) => {
                          const cfg = STATUS_CONFIG[ann.status];
                          const Icon = cfg.icon;
                          return (
                            <li
                              key={ann.id}
                              className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.color}`}
                                >
                                  <Icon className="h-3 w-3" />
                                  {cfg.label}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-slate-200">
                                    {ann.pesticideType}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {new Date(ann.scheduledAt).toLocaleString()} ·{" "}
                                    {(ann.durationMinutes / 60).toFixed(1)} h
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

                  {/* Schedule new spraying form */}
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-700/60 bg-slate-900/30">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Schedule New Spraying
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit(checkWeatherAndSubmit)}
                      className="p-5 space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Pesticide type */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Pesticide Type
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Herbicide (optional)"
                            {...register("pesticideType")}
                            className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                          />
                          {errors.pesticideType && (
                            <p className="mt-1.5 text-xs text-rose-400">
                              {errors.pesticideType.message}
                            </p>
                          )}
                        </div>

                        {/* Duration */}
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
                          {errors.durationHours && (
                            <p className="mt-1.5 text-xs text-rose-400">
                              {errors.durationHours.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Scheduled Date &amp; Time
                        </label>
                        <input
                          type="datetime-local"
                          min={minDateTime}
                          {...register("scheduledAt")}
                          className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all [color-scheme:dark]"
                        />
                        {errors.scheduledAt && (
                          <p className="mt-1.5 text-xs text-rose-400">
                            {errors.scheduledAt.message}
                          </p>
                        )}
                      </div>

                      {/* Notes */}
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

                      {/* Warning banner */}
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
                        ⚠️ All beekeepers within <strong>5 km</strong> of this parcel will receive
                        an email warning. Please schedule at least <strong>24 hours</strong> in
                        advance when possible.
                      </div>

                      {/* Weather warning */}
                      {weatherWarning && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300 flex flex-col gap-2">
                          <div className="flex items-center gap-2 font-semibold">
                            <AlertTriangle className="h-4 w-4" />
                            Weather Warning
                          </div>
                          <p className="text-rose-400 text-xs">{weatherWarning}</p>
                          <label className="flex items-center gap-2 mt-1 text-xs text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              {...register("bypassWeatherValidation")}
                              className="rounded border-slate-600 bg-slate-800 text-rose-500 focus:ring-rose-500/50"
                            />
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Cancel spraying event?"
        description="The scheduled spraying announcement will be cancelled. Beekeepers will not be re-notified."
        confirmLabel="Cancel Event"
        isDestructive={false}
        onConfirm={handleCancel}
      />
    </PageLayout>
  );
};
