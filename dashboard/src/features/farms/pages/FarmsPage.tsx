import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tractor, MapPin, User, List } from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import { useAuth } from "../../users/hooks/AuthHook";
import type { ParcelDto } from "../models/Parcel";
import { FarmApi } from "../api/farmApi";
import { CropApi } from "../api/sprayingApi";
import { ParcelTable } from "../components/ParcelTable";
import { CreateParcelModal } from "../components/CreateParcelModal";
import { CropManagementModal } from "../components/CropManagementModal";
import { SprayingAnnouncementModal } from "../components/SprayingAnnouncementModal";
import { SprayingRecordTable } from "../components/SprayingRecordTable";
import { useNotify } from "../../../hooks/useNotify";
import ApiaryParcelMap from "../../maps/components/ApiaryParcelMap";

export const FarmsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const { success, error } = useNotify();

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["parcels", user?.id],
    queryFn: () => (user?.id ? FarmApi.getParcelsByFarmer(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const { data: crops = [] } = useQuery({
    queryKey: ["all-crops", parcels.map(p => p.id)],
    queryFn: async () => {
      const allCrops = await Promise.all(parcels.map(p => CropApi.getByParcel(p.id)));
      return allCrops.flat();
    },
    enabled: parcels.length > 0,
  });

  const parcelMapFeatures = useMemo(() => {
    return parcels.map((p) => {
      const crop = crops.find(c => c.parcelId === p.id);
      return {
        id: p.id,
        name: p.name,
        location: { latitude: p.latitude, longitude: p.longitude },
        cropType: crop?.cropType,
        description: crop ? `Currently growing: ${crop.cropType}` : undefined,
      };
    });
  }, [parcels, crops]);

  const handleEdit = (parcel: ParcelDto) => {
    setSelectedParcel(parcel);
    setMapCenter([parcel.latitude, parcel.longitude]);
    setMapZoom(16);
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

  const handleMarkerClick = (id: string, type: "apiary" | "parcel") => {
    if (type === "parcel") {
      const parcel = parcels.find(p => p.id === id);
      if (parcel) handleEdit(parcel);
    }
  };

  const [clickedCoord, setClickedCoord] = useState<{lat: number, lng: number} | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setClickedCoord({ lat, lng });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Tractor className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-200 tracking-tight">My Parcels</h1>
              <p className="text-slate-400 text-sm">
                {parcels.length === 0
                  ? "No parcels yet — create your first one below."
                  : `${parcels.length} parcel${parcels.length === 1 ? "" : "s"} registered`}
              </p>
            </div>
          </div>
          {user?.id && (
            <CreateParcelModal
              initialLocation={clickedCoord}
              onCreated={() => {
                queryClient.invalidateQueries({ queryKey: ["parcels", user?.id] });
                setClickedCoord(null);
              }}
            />
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Map */}
          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <div className="rounded-2xl border border-slate-700 overflow-hidden">
                <ApiaryParcelMap
                  apiaries={[]}
                  parcels={parcelMapFeatures}
                  center={mapCenter}
                  zoom={mapZoom}
                  height="calc(100vh - 250px)"
                  onMapClick={handleMapClick}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
              {clickedCoord && (
                <div className="mt-3 p-3 bg-sky-500/5 border border-sky-500/20 text-sky-400 text-sm rounded-xl flex items-center justify-between">
                  <span>Selected: {clickedCoord.lat.toFixed(5)}, {clickedCoord.lng.toFixed(5)}</span>
                  <button onClick={() => setClickedCoord(null)} className="text-sky-500 hover:text-sky-300 text-xs font-semibold transition-colors">Clear</button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: List and Details */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {selectedParcel ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-md shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-slate-900/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                      </div>
                      <h2 className="text-base font-bold text-slate-200">{selectedParcel.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
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
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all ml-1"
                        aria-label="Back to list"
                        title="Back to list"
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-5">
                    <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        Coordinates
                      </p>
                      <p className="mt-2 text-sm text-slate-300 font-mono">
                        {selectedParcel.latitude.toFixed(5)}, {selectedParcel.longitude.toFixed(5)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        Farmer ID
                      </p>
                      <p className="mt-2 text-sm font-mono text-slate-300 truncate">{selectedParcel.farmerId}</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <SprayingRecordTable
                      parcelId={selectedParcel.id}
                      parcelName={selectedParcel.name}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center p-20 gap-3 rounded-2xl border border-slate-700 bg-slate-800/50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                      <span className="text-slate-400 font-medium">Loading parcels…</span>
                    </div>
                  ) : (
                    <ParcelTable parcels={parcels} onEdit={handleEdit} onDelete={handleDelete} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
