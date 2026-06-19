import React, { useEffect, useState } from "react";
import { PageLayout } from "../../../layouts/PageLayout";
import { useAuth } from "../../users/hooks/AuthHook";
import type { ParcelDto } from "../models/Parcel";
import { FarmApi } from "../api/farmApi";
import { ParcelTable } from "../components/ParcelTable";

export const FarmsPage: React.FC = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      FarmApi.getParcelsByFarmer(user.id).then(setParcels);
    }
  }, [user?.id]);

  const handleEdit = (parcel: ParcelDto) => {
    setSelectedParcel(parcel);
    setMessage(`Editing ${parcel.name} is not yet implemented.`);
  };

  const handleDelete = async (parcelId: string) => {
    const success = await FarmApi.deleteParcel(parcelId);
    if (success) {
      setParcels((current) => current.filter((parcel) => parcel.id !== parcelId));
      setMessage(`Parcel removed successfully.`);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Farm overview</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">My parcels</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Overview of farm parcels, crop types, size, and notes. Use the table actions for quick updates or removal.
              </p>
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            {message}
          </div>
        ) : null}

        <ParcelTable parcels={parcels} onEdit={handleEdit} onDelete={handleDelete} />

        {selectedParcel ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Parcel details</h2>
            <p className="mt-3 text-sm text-slate-600">Selected parcel: {selectedParcel.name}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Location</p>
                <p className="mt-2 text-sm text-slate-700">{selectedParcel.latitude.toFixed(4)}, {selectedParcel.longitude.toFixed(4)}</p>
              </li>
              <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Farmer ID</p>
                <p className="mt-2 text-sm font-mono text-slate-700">{selectedParcel.farmerId}</p>
              </li>
            </ul>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
};
