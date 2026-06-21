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
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30">
        <MapPin className="h-12 w-12 text-slate-700 mb-3" />
        <p className="text-slate-400 font-medium">No parcels yet</p>
        <p className="text-sm text-slate-600 mt-1">Add your first parcel using the button above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-md shadow-sm overflow-hidden">
        <table className="w-full border-separate border-spacing-0">
          <thead className="bg-slate-900/30">
            <tr>
              <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Parcel</th>
              <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Latitude</th>
              <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Longitude</th>
              <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {parcels.map((parcel) => (
              <tr key={parcel.id} className="group hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3.5 text-sm font-semibold text-slate-200">{parcel.name}</td>
                <td className="px-4 py-3.5 font-mono leading-5">
                  <span className="block text-xs text-slate-400">{parcel.latitude.toFixed(5)}</span>
                </td>
                <td className="px-4 py-3.5 font-mono leading-5"> 
                  <span className="block text-xs text-slate-600">{parcel.longitude.toFixed(5)}</span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(parcel)}
                      title="Edit parcel"
                      className="p-1.5 rounded-lg border border-sky-800/40 bg-sky-500/5 text-sky-400 hover:bg-sky-500/20 transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(parcel.id)}
                      title="Delete parcel"
                      className="p-1.5 rounded-lg border border-rose-800/40 bg-rose-500/5 text-rose-400 hover:bg-rose-500/20 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
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