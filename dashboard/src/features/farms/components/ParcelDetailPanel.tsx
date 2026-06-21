import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, User, List, Pencil } from "lucide-react";
import type { ParcelDto } from "../models/Parcel";
import { CropManagementModal } from "./CropManagementModal";
import { SprayingAnnouncementModal } from "./SprayingAnnouncementModal";
import { EditParcelModal } from "./EditParcelModal";
import { SprayingRecordTable } from "./SprayingRecordTable";
import { useQueryClient } from "@tanstack/react-query";

interface ParcelDetailPanelProps {
  parcel: ParcelDto;
  /** Display name of the farmer — shown instead of the raw UID */
  farmerName: string;
  onBack: () => void;
  onParcelUpdated: (updated: ParcelDto) => void;
}

/**
 * ParcelDetailPanel
 *
 * Responsibility: Render the detail view for a single selected parcel.
 * Follows SRP — this component only renders parcel detail UI.
 * All mutations are delegated back to the parent via callbacks or React Query cache.
 */
export const ParcelDetailPanel: React.FC<ParcelDetailPanelProps> = ({
  parcel,
  farmerName,
  onBack,
  onParcelUpdated,
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();

  function handleParcelUpdated(updated: ParcelDto) {
    onParcelUpdated(updated);
    // Invalidate the parcel query so the list also refreshes
    queryClient.invalidateQueries({ queryKey: ["parcels"] });
  }

  return (
    <>
      <motion.div
        key={`detail-${parcel.id}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-md shadow-sm overflow-hidden"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-slate-900/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <MapPin className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-bold text-slate-200 truncate">{parcel.name}</h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {/* Edit parcel button */}
            <button
              onClick={() => setEditOpen(true)}
              title="Edit name / location"
              className="p-1.5 rounded-lg border border-sky-800/40 bg-sky-500/5 text-sky-400 hover:bg-sky-500/20 transition-all"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            {/* Crop management */}
            <CropManagementModal parcelId={parcel.id} parcelName={parcel.name} />

            {/* Spraying announcement */}
            <SprayingAnnouncementModal parcelId={parcel.id} parcelName={parcel.name} />

            {/* Back to list */}
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all ml-1"
              aria-label="Back to list"
              title="Back to list"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 p-5">
          {/* Coordinates */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Coordinates
            </p>
            <p className="mt-2 text-sm text-slate-300 font-mono">
              {parcel.latitude.toFixed(5)}
            </p>
            <p className="text-sm text-slate-300 font-mono">
              {parcel.longitude.toFixed(5)}
            </p>
          </div>

          {/* Farmer name — shown instead of raw UID */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Farmer
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-300 truncate">{farmerName}</p>
          </div>
        </div>

        {/* Spraying record history */}
        <div className="px-5 pb-5">
          <SprayingRecordTable parcelId={parcel.id} parcelName={parcel.name} />
        </div>
      </motion.div>

      {/* Edit modal — rendered outside the panel so it doesn't inherit overflow:hidden */}
      <EditParcelModal
        parcel={parcel}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={handleParcelUpdated}
      />
    </>
  );
};
