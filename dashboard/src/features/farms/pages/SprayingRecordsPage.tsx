import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  MapPin,
  Calendar,
  Clock,
  Download,
} from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import { useAuth } from "../../users/hooks/AuthHook";
import { useApis } from "../../../shared/api/useApis";
import type { ParcelDto } from "../models/Parcel";

export const SprayingRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const { farms: farmApi, spraying: sprayingApi } = useApis();

  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const { data: parcels = [], isLoading: parcelsLoading } = useQuery({
    queryKey: ["parcels", user?.id],
    queryFn: () => (user?.id ? farmApi.getParcelsByFarmer(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["sprayingRecords", selectedParcel?.id, fromDate, toDate],
    queryFn: async () => {
      if (!selectedParcel) return [];
      let data = await sprayingApi.getRecordsByParcel(selectedParcel.id);
      
      if (fromDate) {
        const fromDateObj = new Date(fromDate);
        data = data.filter(r => new Date(r.executedAt) >= fromDateObj);
      }
      if (toDate) {
        const toDateObj = new Date(toDate);
        // add one day to make 'toDate' inclusive
        toDateObj.setDate(toDateObj.getDate() + 1);
        data = data.filter(r => new Date(r.executedAt) < toDateObj);
      }
      return data;
    },
    enabled: !!selectedParcel?.id,
  });

  const handleExport = async () => {
    if (!selectedParcel) return;
    try {
      setIsExporting(true);
      const blob = await sprayingApi.exportRecordsPdf(selectedParcel.id, fromDate || undefined, toDate || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Spraying_Records_${selectedParcel.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <FileText className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Digital Spraying Record</h1>
            <p className="text-slate-400 text-sm">
              Historical view of all executed treatments on a specific parcel.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left: Parcel selector ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-md overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/60 bg-slate-900/30">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Select Parcel
                </p>
              </div>

              {parcelsLoading ? (
                <div className="flex items-center justify-center gap-3 py-12">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500" />
                  <span className="text-slate-400 text-sm">Loading parcels…</span>
                </div>
              ) : parcels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <MapPin className="h-10 w-10 text-slate-700 mb-3" />
                  <p className="text-slate-400 font-medium">No parcels found</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-700/60">
                  {parcels.map((parcel) => {
                    const isSelected = selectedParcel?.id === parcel.id;
                    return (
                      <li key={parcel.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedParcel(parcel)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                            isSelected
                              ? "bg-cyan-500/5 text-cyan-300"
                              : "hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                              isSelected ? "bg-cyan-500/15" : "bg-slate-700/60"
                            }`}
                          >
                            <MapPin
                              className={`h-4 w-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{parcel.name}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ── Right: Records panel ── */}
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
                    <FileText className="h-7 w-7 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-semibold">No parcel selected</p>
                  <p className="text-sm text-slate-600 mt-1 max-w-xs">
                    Select a parcel from the list to view historical spraying records.
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
                  {/* Filters and Export */}
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From Date</label>
                          <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To Date</label>
                          <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors h-[38px] md:w-auto w-full"
                      >
                        {isExporting ? (
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Records list */}
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-700/60 bg-slate-900/30">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Spraying History
                      </p>
                    </div>

                    {recordsLoading ? (
                      <div className="flex items-center gap-2 py-6 px-5 text-slate-500 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500" />
                        Loading…
                      </div>
                    ) : records.length === 0 ? (
                      <p className="text-sm text-slate-600 py-6 px-5">
                        No spraying records found for this parcel.
                      </p>
                    ) : (
                      <ul className="divide-y divide-slate-700/60">
                        {records.map((rec) => (
                          <li key={rec.id} className="p-5 hover:bg-slate-800/40 transition-colors space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm font-semibold text-slate-200">{rec.pesticideType || "Unknown pesticide"}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                {new Date(rec.executedAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="h-3.5 w-3.5 text-slate-500" />
                                {rec.durationMinutes} min
                              </div>
                            </div>
                            {rec.weatherConditions && (
                              <p className="text-xs text-slate-500 mt-2 bg-slate-900/50 p-2 rounded-lg inline-block border border-slate-700">
                                {rec.weatherConditions}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
