import type { BeehiveType } from "../../../types/BeehiveType";

export type Beehive = {
  id: number;
  type: BeehiveType;
  designation: string;
  superColor: string;
  queenAge: number;
  note?: string;
  apiaryId: number;
  smartScaleId?: number;
};
