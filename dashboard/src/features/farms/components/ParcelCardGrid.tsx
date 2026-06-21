import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Trash2, Pencil, Leaf, Siren } from "lucide-react";
import type { ParcelDto } from "../models/Parcel";
import type { CropDto } from "../models/Crop";
import { CROP_OPTIONS } from "../models/Crop";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

interface ParcelCardGridProps {
  parcels: ParcelDto[];
  crops: CropDto[];
  farmerName: string;
  selectedParcelId?: string | null;
  onSelect: (parcel: ParcelDto) => void;
  onEdit: (parcel: ParcelDto) => void;
  onDelete: (parcelId: string) => void;
}

/** Returns the first crop for a given parcel, or undefined */
function getParcelCrop(crops: CropDto[], parcelId: string): CropDto | undefined {
  return crops.find((c) => c.parcelId === parcelId);
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: "easeOut" },
  }),
};

/**
 * ParcelCardGrid
 *
 * Responsibility: Render the parcel list as an interactive card grid.
 * Each card shows the crop badge, coordinates, and quick-action buttons.
 * Selection is handled by the parent (FarmsPage) to maintain SRP.
 */
export const ParcelCardGrid: React.FC<ParcelCardGridProps> = ({
  parcels,
  crops,
  farmerName,
  selectedParcelId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const pendingParcel = parcels.find((p) => p.id === confirmId);

  if (parcels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 mb-4">
          <MapPin className="h-7 w-7 text-slate-600" />
        </div>
        <p className="text-slate-400 font-semibold">No parcels yet</p>
        <p className="text-sm text-slate-600 mt-1 max-w-xs">
          Click anywhere on the map to pin a location, then use "Add Parcel" to register it.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {parcels.map((parcel, i) => {
          const crop = getParcelCrop(crops, parcel.id);
          const cropOpt = crop ? CROP_OPTIONS.find((o) => o.value === crop.cropType) : null;
          const isSelected = selectedParcelId === parcel.id;

          return (
            <motion.div
              key={parcel.id}
              custom={i}
              variants={cardVariants as any}
              initial="hidden"
              animate="visible"
              className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? "border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
              }`}
              onClick={() => onSelect(parcel)}
              title={`Farmer: ${farmerName}`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-2xl" />
              )}

              <div className="flex items-center gap-4 px-4 py-3.5">
                {/* Crop emoji / fallback icon */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-colors ${
                    crop
                      ? "bg-emerald-500/10"
                      : "bg-slate-700/60"
                  }`}
                >
                  {cropOpt ? cropOpt.emoji : <MapPin className="h-5 w-5 text-slate-500" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate transition-colors ${isSelected ? "text-emerald-300" : "text-slate-200"}`}>
                    {parcel.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {crop ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        <Leaf className="h-2.5 w-2.5" />
                        {crop.cropType}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">No crop assigned</span>
                    )}
                    <span className="text-xs text-slate-600 font-mono">
                      {parcel.latitude.toFixed(4)}, {parcel.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Action buttons — visible on hover or when selected */}
                <div
                  className={`flex items-center gap-1.5 transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
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

                {/* Spraying indicator — shown when selected */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <Siren className="h-4 w-4 text-rose-400/60" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
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
