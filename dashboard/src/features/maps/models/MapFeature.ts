export type GeoLocation = {
  latitude: number;
  longitude: number;
};

export type ApiaryMapFeature = {
  id: string;
  name: string;
  location: GeoLocation;
  beekeeperName?: string;
  hiveCount?: number;
  description?: string;
};

export type ParcelMapFeature = {
  id: string;
  name: string;
  location: GeoLocation;
  cropType?: string;
  areaSquareMeters?: number;
  description?: string;
};

export type MapFeatureType = "apiary" | "parcel";

export type MapMarker = {
  id: string;
  type: MapFeatureType;
  lat: number;
  lng: number;
  name: string;
  description?: string;
  rawFeature: ApiaryMapFeature | ParcelMapFeature;
};

export type MapFeatureCollection = {
  markers: MapMarker[];
  bounds: [[number, number], [number, number]] | null;
};
