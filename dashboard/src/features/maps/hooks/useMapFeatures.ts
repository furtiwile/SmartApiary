import { useMemo } from "react";
import type {
  ApiaryMapFeature,
  MapFeatureCollection,
  MapMarker,
  MapFeatureType,
  ParcelMapFeature,
} from "../models/MapFeature";

const createMarker = (
  feature: ApiaryMapFeature | ParcelMapFeature,
  type: MapFeatureType
): MapMarker => ({
  id: feature.id,
  type,
  lat: feature.location.latitude,
  lng: feature.location.longitude,
  name: feature.name,
  description: feature.description,
  rawFeature: feature,
});

export function useMapFeatures(
  apiaries: ApiaryMapFeature[] = [],
  parcels: ParcelMapFeature[] = []
): MapFeatureCollection {
  return useMemo(() => {
    const markers = [
      ...apiaries.map((apiary) => createMarker(apiary, "apiary")),
      ...parcels.map((parcel) => createMarker(parcel, "parcel")),
    ];

    const bounds = markers.length
      ? [
          [
            Math.min(...markers.map((marker) => marker.lat)),
            Math.min(...markers.map((marker) => marker.lng)),
          ],
          [
            Math.max(...markers.map((marker) => marker.lat)),
            Math.max(...markers.map((marker) => marker.lng)),
          ],
        ] as [[number, number], [number, number]]
      : null;

    return { markers, bounds };
  }, [apiaries, parcels]);
}
