import type { BeehiveType } from "../../../types/BeehiveType";

// TODO: See which fields are needed.
// Some things are fucking hard
// to figure out in this codebase
export type Beehive = {
  id: number; // bigint
  name: string;
  type: BeehiveType;
  designation: string;
  latitude?: number;
  longtitude?: number;
  imageLocation: string; // Append "_thumbnail" or "_full" before image format
  location?: string;
  terrainDescription?: string;
  superColor?: string;
  queenAge?: number;
  note?: string;

  apiaryId?: string;
  smartScaleId?: string
};
