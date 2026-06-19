import React from "react";
import type { ParcelDto } from "../models/Parcel";

interface ParcelTableProps {
  parcels: ParcelDto[];
  onEdit: (parcel: ParcelDto) => void;
  onDelete: (parcelId: string) => void;
}

export const ParcelTable: React.FC<ParcelTableProps> = ({ parcels, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
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
            <tr key={parcel.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{parcel.name}</td>
              <td className="px-4 py-3 text-slate-600">{parcel.latitude.toFixed(4)}</td>
              <td className="px-4 py-3 text-slate-600">{parcel.longitude.toFixed(4)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(parcel)}
                  className="mr-2 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(parcel.id)}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
