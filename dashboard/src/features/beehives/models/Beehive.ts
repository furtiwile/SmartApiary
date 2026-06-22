import type { BeehiveType } from "../../../types/BeehiveType";

export type Beehive = {
  id: string;
  name: string;
  type: BeehiveType;
  designation: string;
  /** Fixed typo: was 'longtitude' */
  latitude?: number;
  longitude?: number;
  imageLocation?: string;
  location?: string;
  terrainDescription?: string;
  superColor?: string;
  queenAge?: number;
  note?: string;
  apiaryId?: string;
  smartScaleId?: string;
  smartScaleSerialNumber?: string;
  isSmartScaleActivated?: boolean;
  weightDropThreshold?: number | null;
};
