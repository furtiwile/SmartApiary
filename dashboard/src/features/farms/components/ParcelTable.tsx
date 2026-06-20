import React, { useState } from "react";
import { Trash2, Pencil, MapPin } from "lucide-react";
import type { ParcelDto } from "../models/Parcel";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

interface ParcelTableProps {
  parcels: ParcelDto[];
  onEdit: (parcel: ParcelDto) => void;
  onDelete: (parcelId: string) => void;
}

export const ParcelTable: React.FC<ParcelTableProps> = ({ parcels, onEdit, onDelete }) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const pendingParcel = parcels.find((p) => p.id === confirmId);

  if (parcels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <MapPin className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">No parcels yet</p>
        <p className="text-sm text-slate-400 mt-1">Add your first parcel using the button above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 uppercase tracking-[0.17em] text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Parcel</th>
              <th className="px-4 py-3">Latitude</th>
              <th className="px-4 py-3">Longitude</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {parcels.map((parcel) => (
              <tr key={parcel.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{parcel.name}</td>
                <td className="px-4 py-3 text-slate-600 font-mono">{parcel.latitude.toFixed(5)}</td>
                <td className="px-4 py-3 text-slate-600 font-mono">{parcel.longitude.toFixed(5)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(parcel)}
                    className="mr-2 inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(parcel.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => { if (!open) setConfirmId(null); }}
        title="Delete parcel?"
        description={`"${pendingParcel?.name ?? "This parcel"}" will be permanently deleted along with all its crops and spraying records.`}
        confirmLabel="Delete Parcel"
        onConfirm={() => {
          if (confirmId) onDelete(confirmId);
          setConfirmId(null);
        }}
      />
    </>
  );
};
