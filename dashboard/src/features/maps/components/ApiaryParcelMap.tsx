import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ApiaryMapFeature, ParcelMapFeature } from "../models/MapFeature";
import { useMapFeatures } from "../hooks/useMapFeatures";
import "../styles/MapStyles.css";

type ApiaryParcelMapProps = {
  apiaries: ApiaryMapFeature[];
  parcels: ParcelMapFeature[];
  center?: [number, number];
  zoom?: number;
  height?: string;
};

const DEFAULT_CENTER: [number, number] = [45.250, 19.842];
const DEFAULT_ZOOM = 8;

const createApiaryIcon = () =>
  L.icon({
    iconUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23f59e0b' d='M12 2C7.03 2 3 6.03 3 11c0 4.5 3.9 8.97 8.58 11.74.26.16.6.16.86 0C17.1 19.97 21 15.5 21 11c0-4.97-4.03-9-9-9zm0 14.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 11.5 12 11.5s2.5 1.12 2.5 2.5S13.38 16.5 12 16.5z'/%3E%3C/svg%3E",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });

const createParcelIcon = () =>
  L.icon({
    iconUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2310b981' d='M3 3h18v18H3V3zm5 4v10h10V7H8zm2 2h6v2H10V9z'/%3E%3C/svg%3E",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });

const buildPopupContent = (
  apiary: ApiaryMapFeature | ParcelMapFeature,
  type: "apiary" | "parcel"
) => {
  if (type === "apiary") {
    const { beekeeperName, hiveCount, description } = apiary as ApiaryMapFeature;
    return `
      <div class="map-popup">
        <div class="map-popup-title">${apiary.name}</div>
        ${beekeeperName ? `<div><strong>Beekeeper:</strong> ${beekeeperName}</div>` : ""}
        ${hiveCount !== undefined ? `<div><strong>Hives:</strong> ${hiveCount}</div>` : ""}
        ${description ? `<div>${description}</div>` : ""}
        <div><strong>Lat:</strong> ${apiary.location.latitude.toFixed(5)}</div>
        <div><strong>Lng:</strong> ${apiary.location.longitude.toFixed(5)}</div>
      </div>
    `;
  }

  const { cropType, areaSquareMeters, description } = apiary as ParcelMapFeature;
  return `
    <div class="map-popup">
      <div class="map-popup-title">${apiary.name}</div>
      ${cropType ? `<div><strong>Crop:</strong> ${cropType}</div>` : ""}
      ${areaSquareMeters !== undefined ? `<div><strong>Area:</strong> ${areaSquareMeters} m²</div>` : ""}
      ${description ? `<div>${description}</div>` : ""}
      <div><strong>Lat:</strong> ${apiary.location.latitude.toFixed(5)}</div>
      <div><strong>Lng:</strong> ${apiary.location.longitude.toFixed(5)}</div>
    </div>
  `;
};

const ApiaryParcelMap: React.FC<ApiaryParcelMapProps> = ({
  apiaries,
  parcels,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = "500px",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const { markers, bounds } = useMapFeatures(apiaries, parcels);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center,
        zoom,
        minZoom: 3,
        maxZoom: 19,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      markersRef.current.addTo(mapRef.current);
    }

    return () => {
      // Keep map instance alive across re-renders.
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.clearLayers();

    markers.forEach((marker) => {
      const icon = marker.type === "apiary" ? createApiaryIcon() : createParcelIcon();
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon });
      leafletMarker.bindPopup(buildPopupContent(marker.rawFeature, marker.type));
      markersRef.current.addLayer(leafletMarker);
    });

    if (bounds && markers.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }, [markers, bounds]);

  return (
    <div
      ref={containerRef}
      className="apiary-parcel-map rounded-xl border border-slate-700 overflow-hidden"
      style={{ height, width: "100%" }}
    />
  );
};

export default ApiaryParcelMap;
