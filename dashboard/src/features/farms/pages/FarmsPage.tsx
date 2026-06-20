import React, { useEffect, useState } from "react";
import { PageLayout } from "../../../layouts/PageLayout";
import { useAuth } from "../../users/hooks/AuthHook";
import type { ParcelDto } from "../models/Parcel";
import { FarmApi } from "../api/farmApi";
import { ParcelTable } from "../components/ParcelTable";
import { CreateParcelModal } from "../components/CreateParcelModal";
import { useNotify } from "../../../hooks/useNotify";
import { Tractor } from "lucide-react";

export const FarmsPage: React.FC = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useNotify();

  useEffect(() => {
    if (user?.id) {
      FarmApi.getParcelsByFarmer(user.id)
        .then(setParcels)
        .finally(() => setIsLoading(false));
    }
  }, [user?.id]);

  const handleEdit = (parcel: ParcelDto) => {
    setSelectedParcel(parcel);
  };

  const handleDelete = async (parcelId: string) => {
    const deleted = await FarmApi.deleteParcel(parcelId);
    if (deleted) {
      setParcels((current) => current.filter((p) => p.id !== parcelId));
      if (selectedParcel?.id === parcelId) setSelectedParcel(null);
      success("Parcel removed", "The parcel has been successfully deleted.");
    } else {
      error("Failed to delete", "Could not remove the parcel. Please try again.");
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
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
              farmerId={user.id}
              onCreated={(parcel) => setParcels((prev) => [...prev, parcel])}
            />
          )}
        </div>

        {/* Parcels table */}
        {isLoading ? (
          <div className="flex justify-center items-center p-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            <span className="text-slate-500 font-medium">Loading parcels…</span>
          </div>
        ) : (
          <ParcelTable parcels={parcels} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        {/* Selected parcel detail */}
        {selectedParcel && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">{selectedParcel.name}</h2>
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Location</p>
                <p className="mt-2 text-sm text-slate-700 font-mono">
                  {selectedParcel.latitude.toFixed(5)}, {selectedParcel.longitude.toFixed(5)}
                </p>
              </li>
              <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Farmer ID</p>
                <p className="mt-2 text-sm font-mono text-slate-700 truncate">{selectedParcel.farmerId}</p>
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-400">
              Crop management and spraying announcements will be available here in Phase 3.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
