import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Tractor } from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import { useAuth } from "../../users/hooks/AuthHook";
import type { ParcelDto } from "../models/Parcel";
import { ParcelCardGrid } from "../components/ParcelCardGrid";
import { ParcelDetailPanel } from "../components/ParcelDetailPanel";
import { CreateParcelModal } from "../components/CreateParcelModal";
import { useNotify } from "../../../hooks/useNotify";
import ApiaryParcelMap from "../../maps/components/ApiaryParcelMap";
import { useApis } from "../../../shared/api/useApis";

/**
 * FarmsPage
 *
 * Responsibility: Orchestrate the farmer's parcel management workflow.
 * - Owns: parcel list state, selected parcel state, map interaction state.
 * - Delegates: list rendering → ParcelCardGrid, detail rendering → ParcelDetailPanel.
 *
 * SOLID: Open/Closed — new parcel features are added by composing child components,
 * not by modifying FarmsPage directly.
 */
export const FarmsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error } = useNotify();
  const { crops: cropApi, farms: farmApi } = useApis();

  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Ref for scrolling the right panel into view on mobile when a marker is clicked
  const detailRef = useRef<HTMLDivElement>(null);

  // ── Derive the farmer's display name from the auth context ─────────────────
  // The user object from JWT contains firstName & lastName — no extra API call needed.
  const farmerName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
    : "Unknown";

  // ── Parcels query ──────────────────────────────────────────────────────────
  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["parcels", user?.id],
    queryFn: () => (user?.id ? farmApi.getParcelsByFarmer(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  // ── Crops query (for card grid crop badges) ────────────────────────────────
  const { data: crops = [] } = useQuery({
    queryKey: ["all-crops", parcels.map((p) => p.id)],
    queryFn: async () => {
      const allCrops = await Promise.all(parcels.map((p) => cropApi.getByParcel(p.id)));
      return allCrops.flat();
    },
    enabled: parcels.length > 0,
  });

  // ── Map feature shapes ─────────────────────────────────────────────────────
  const parcelMapFeatures = useMemo(() => {
    return parcels.map((p) => {
      const crop = crops.find((c) => c.parcelId === p.id);
      return {
        id: p.id,
        name: p.name,
        location: { latitude: p.latitude, longitude: p.longitude },
        cropType: crop?.cropType,
        description: crop ? `Currently growing: ${crop.cropType}` : undefined,
      };
    });
  }, [parcels, crops]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Select a parcel and pan the map to its location */
  function handleSelect(parcel: ParcelDto) {
    setSelectedParcel(parcel);
    setMapCenter([parcel.latitude, parcel.longitude]);
    setMapZoom(16);
    // Scroll the right column into view on small screens
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  /** Open the edit modal for the given parcel (passed through ParcelDetailPanel) */
  function handleEdit(parcel: ParcelDto) {
    handleSelect(parcel);
  }

  async function handleDelete(parcelId: string) {
    const deleted = await farmApi.deleteParcel(parcelId);
    if (deleted) {
      queryClient.setQueryData<ParcelDto[]>(["parcels", user?.id], (old) =>
        old?.filter((p) => p.id !== parcelId)
      );
      if (selectedParcel?.id === parcelId) setSelectedParcel(null);
      success("Parcel removed", "The parcel has been successfully deleted.");
    } else {
      error("Failed to delete", "Could not remove the parcel. Please try again.");
    }
  }

  /** Map marker click → highlight the parcel in the right panel */
  function handleMarkerClick(id: string, type: "apiary" | "parcel") {
    if (type === "parcel") {
      const parcel = parcels.find((p) => p.id === id);
      if (parcel) handleSelect(parcel);
    }
  }

  function handleMapClick(lat: number, lng: number) {
    setClickedCoord({ lat, lng });
  }

  /** Called by ParcelDetailPanel when the parcel is successfully edited */
  function handleParcelUpdated(updated: ParcelDto) {
    // Update the selected parcel state immediately so the detail panel reflects changes
    setSelectedParcel(updated);
    // Update the list cache
    queryClient.setQueryData<ParcelDto[]>(["parcels", user?.id], (old) =>
      old?.map((p) => (p.id === updated.id ? updated : p))
    );
    // Re-pan the map if coordinates changed
    setMapCenter([updated.latitude, updated.longitude]);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
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
              <h1 className="text-2xl font-bold text-slate-200 tracking-tight">My Fields</h1>
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

        {/* Main content grid: Map (left) + List/Detail (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left: Map ── */}
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
                  <span>
                    Selected: {clickedCoord.lat.toFixed(5)}, {clickedCoord.lng.toFixed(5)}
                  </span>
                  <button
                    onClick={() => setClickedCoord(null)}
                    className="text-sky-500 hover:text-sky-300 text-xs font-semibold transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: List or Detail ── */}
          <div className="lg:col-span-2 space-y-4" ref={detailRef}>
            <AnimatePresence mode="popLayout">
              {selectedParcel ? (
                <ParcelDetailPanel
                  key={`detail-${selectedParcel.id}`}
                  parcel={selectedParcel}
                  farmerName={farmerName}
                  onBack={() => setSelectedParcel(null)}
                  onParcelUpdated={handleParcelUpdated}
                />
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
                    <ParcelCardGrid
                      parcels={parcels}
                      crops={crops}
                      farmerName={farmerName}
                      selectedParcelId={null}
                      onSelect={handleSelect}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
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
