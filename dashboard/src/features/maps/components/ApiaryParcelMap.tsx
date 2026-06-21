import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/MapStyles.css";
import type { ApiaryMapFeature, ParcelMapFeature } from "../models/MapFeature";
import { CROP_OPTIONS } from "../../farms/models/Crop";

// ---------------------------------------------------------------------------
// Custom DivIcons using inline SVG — no external assets, no XSS risk
// ---------------------------------------------------------------------------

function createDivIcon(emoji: string, bgColor: string) {
  return L.divIcon({
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${bgColor};
        border-radius: 50% 50% 50% 4px;
        transform: rotate(-45deg);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        border: 2px solid rgba(255,255,255,0.2);
      ">
        <span style="transform: rotate(45deg); font-size: 16px; line-height: 1;">${emoji}</span>
      </div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

const apiaryIcon = createDivIcon("🍯", "#f59e0b");

function getParcelIcon(cropType?: string) {
  const opt = CROP_OPTIONS.find((c) => c.value === cropType);
  return createDivIcon(opt?.emoji || "🌾", "#10b981");
}

// ---------------------------------------------------------------------------
// Auto-fit bounds helper (must live inside MapContainer)
// ---------------------------------------------------------------------------

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const positionsStr = JSON.stringify(positions);
  useMemo(() => {
    const parsedPositions = JSON.parse(positionsStr) as [number, number][];
    if (parsedPositions.length === 0) return;
    const bounds = L.latLngBounds(parsedPositions);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });
  }, [map, positionsStr]);
  return null;
}

// ---------------------------------------------------------------------------
// Click handler helper
// ---------------------------------------------------------------------------

function MapEventsHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

type ApiaryParcelMapProps = {
  apiaries: ApiaryMapFeature[];
  parcels: ParcelMapFeature[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: string, type: "apiary" | "parcel") => void;
};

const DEFAULT_CENTER: [number, number] = [45.25, 19.842];
const DEFAULT_ZOOM = 8;

export default function ApiaryParcelMap({
  apiaries,
  parcels,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = "500px",
  onMapClick,
  onMarkerClick,
}: ApiaryParcelMapProps) {
  const allPositions = useMemo<[number, number][]>(() => [
    ...apiaries.map((a) => [a.location.latitude, a.location.longitude] as [number, number]),
    ...parcels.map((p) => [p.location.latitude, p.location.longitude] as [number, number]),
  ], [apiaries, parcels]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
      className="apiary-parcel-map rounded-xl border border-slate-700 overflow-hidden"
      minZoom={3}
      maxZoom={19}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <MapEventsHandler onMapClick={onMapClick} />

      {/* Auto-fit when data changes */}
      {allPositions.length > 0 && <FitBounds positions={allPositions} />}

      {/* Apiary markers */}
      {apiaries.map((apiary) => (
        <Marker
          key={apiary.id}
          position={[apiary.location.latitude, apiary.location.longitude]}
          icon={apiaryIcon}
          eventHandlers={{ click: () => onMarkerClick?.(apiary.id, "apiary") }}
        >
          <Popup>
            <div className="map-popup">
              <div className="map-popup-title">{apiary.name}</div>
              {apiary.beekeeperName && <div><strong>Beekeeper:</strong> {apiary.beekeeperName}</div>}
              {apiary.hiveCount !== undefined && <div><strong>Hives:</strong> {apiary.hiveCount}</div>}
              {apiary.description && <div>{apiary.description}</div>}
              <div className="mt-1 text-xs opacity-60 font-mono">
                {apiary.location.latitude.toFixed(5)}, {apiary.location.longitude.toFixed(5)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Parcel markers */}
      {parcels.map((parcel) => (
        <Marker
          key={parcel.id}
          position={[parcel.location.latitude, parcel.location.longitude]}
          icon={getParcelIcon(parcel.cropType)}
          eventHandlers={{ click: () => onMarkerClick?.(parcel.id, "parcel") }}
        >
          <Popup>
            <div className="map-popup">
              <div className="map-popup-title">{parcel.name}</div>
              {parcel.cropType && <div><strong>Crop:</strong> {parcel.cropType}</div>}
              {parcel.areaSquareMeters !== undefined && (
                <div><strong>Area:</strong> {parcel.areaSquareMeters.toLocaleString()} m²</div>
              )}
              {parcel.description && <div>{parcel.description}</div>}
              <div className="mt-1 text-xs opacity-60 font-mono">
                {parcel.location.latitude.toFixed(5)}, {parcel.location.longitude.toFixed(5)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
