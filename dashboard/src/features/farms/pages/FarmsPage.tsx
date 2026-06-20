import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tractor, X, MapPin, User } from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import { useAuth } from "../../users/hooks/AuthHook";
import type { ParcelDto } from "../models/Parcel";
import { FarmApi } from "../api/farmApi";
import { ParcelTable } from "../components/ParcelTable";
import { CreateParcelModal } from "../components/CreateParcelModal";
import { CropManagementModal } from "../components/CropManagementModal";
import { SprayingAnnouncementModal } from "../components/SprayingAnnouncementModal";
import { SprayingRecordTable } from "../components/SprayingRecordTable";
import { useNotify } from "../../../hooks/useNotify";

export const FarmsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const { success, error } = useNotify();

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["parcels", user?.id],
    queryFn: () => (user?.id ? FarmApi.getParcelsByFarmer(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const handleEdit = (parcel: ParcelDto) => {
    setSelectedParcel(parcel);
  };

  const handleDelete = async (parcelId: string) => {
    const deleted = await FarmApi.deleteParcel(parcelId);
    if (deleted) {
      queryClient.setQueryData<ParcelDto[]>(["parcels", user?.id], (old) =>
        old?.filter((p) => p.id !== parcelId)
      );
      if (selectedParcel?.id === parcelId) setSelectedParcel(null);
      success("Parcel removed", "The parcel has been successfully deleted.");
    } else {
      error("Failed to delete", "Could not remove the parcel. Please try again.");
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Tractor className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Farm overview</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">My parcels</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Manage farm parcels, crops, and spraying schedules.
              </p>
            </div>
          </div>
          {user?.id && (
            <CreateParcelModal
              onCreated={(parcel) =>
                queryClient.setQueryData<ParcelDto[]>(["parcels", user?.id], (old) => [
                  ...(old || []),
                  parcel as ParcelDto,
                ])
              }
            />
          )}
        </motion.div>

        {/* Parcels table */}
        {isLoading ? (
          <div className="flex justify-center items-center p-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            <span className="text-slate-500 font-medium">Loading parcels…</span>
          </div>
        ) : (
          <ParcelTable parcels={parcels} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        {/* Selected parcel detail panel */}
        <AnimatePresence mode="popLayout">
          {selectedParcel && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
            {/* Detail header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">{selectedParcel.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Crop & Spraying action buttons */}
                <CropManagementModal
                  parcelId={selectedParcel.id}
                  parcelName={selectedParcel.name}
                />
                <SprayingAnnouncementModal
                  parcelId={selectedParcel.id}
                  parcelName={selectedParcel.name}
                />
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all ml-2"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  Coordinates
                </p>
                <p className="mt-2 text-sm text-slate-700 font-mono">
                  {selectedParcel.latitude.toFixed(5)}, {selectedParcel.longitude.toFixed(5)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Farmer ID
                </p>
                <p className="mt-2 text-sm font-mono text-slate-700 truncate">{selectedParcel.farmerId}</p>
              </div>
            </div>

            {/* Spraying records + PDF export */}
            <div className="px-5 pb-5">
              <SprayingRecordTable
                parcelId={selectedParcel.id}
                parcelName={selectedParcel.name}
              />
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};
