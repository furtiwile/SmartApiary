import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import ApiaryParcelMap from "../components/ApiaryParcelMap";
import { useApis } from "../../../shared/api/useApis";
import { useApiaries } from "../../beehives/hooks/useApiaries";
import { useAuth } from "../../users/hooks/AuthHook";

export const CropsMapPage: React.FC = () => {
  const { user } = useAuth();
  const { crops: cropApi } = useApis();
  const { apiaries } = useApiaries();

  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);

  const { data: allCrops = [], isLoading } = useQuery({
    queryKey: ["all-crops-nearby"],
    queryFn: () => cropApi.getAll(),
  });

  const apiaryMapFeatures = useMemo(() => {
    return apiaries.map((a) => ({
      id: a.id,
      name: a.name,
      location: { latitude: a.latitude, longitude: a.longitude },
      description: a.description,
      beekeeperName: user?.firstName ? `${user.firstName} ${user.lastName}` : "Me",
      thumbnailUrl: a.thumbnailUrl,
    }));
  }, [apiaries, user]);

  const parcelMapFeatures = useMemo(() => {
    return allCrops.map((c: any) => ({
      id: c.parcelId,
      name: c.parcelName || "Parcel",
      location: { latitude: c.latitude, longitude: c.longitude },
      cropType: c.cropType,
      description: c.expectedBloomDate
        ? `Blooming: ${new Date(c.expectedBloomDate).toLocaleDateString(undefined, { timeZone: "UTC" })}`
        : undefined,
    }));
  }, [allCrops]);

  return (
    <PageLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Sown Crops Map</h1>
            <p className="text-slate-400 text-sm">
              Discover crops sown by farmers near your apiaries.
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center p-20 gap-3 rounded-2xl border border-slate-700 bg-slate-800/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            <span className="text-slate-400 font-medium">Loading map data…</span>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <ApiaryParcelMap
              apiaries={apiaryMapFeatures}
              parcels={parcelMapFeatures}
              center={mapCenter}
              zoom={mapZoom}
              height="calc(100vh - 200px)"
              onMarkerClick={(id, type) => {
                if (type === "apiary") {
                  const a = apiaries.find(x => x.id === id);
                  if (a) {
                    setMapCenter([a.latitude, a.longitude]);
                    setMapZoom(14);
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
};
