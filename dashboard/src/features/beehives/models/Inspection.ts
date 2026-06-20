/** Hive Diary inspection entry */
export type InspectionEntry = {
  id: string;
  hiveId: string;
  inspectedAt: string;       // ISO datetime
  boardColor?: string;       // Pollen load indicator colour
  framesOfHoney?: number;
  honeyKg?: number;
  framesOfBrood?: number;
  queenSeen: boolean;
  queenLayingEggs?: boolean;
  notes?: string;
};

export type CreateInspectionPayload = Omit<InspectionEntry, "id">;

export const BOARD_COLORS = [
  { value: "Yellow", label: "Yellow (Dandelion / Spring)", hex: "#fbbf24" },
  { value: "Orange", label: "Orange (Fruit trees)", hex: "#f97316" },
  { value: "Gray",   label: "Gray (Mixed pollen)",   hex: "#9ca3af" },
  { value: "Brown",  label: "Brown (Late season)",   hex: "#92400e" },
  { value: "White",  label: "White (Acacia)",        hex: "#e2e8f0" },
  { value: "Other",  label: "Other",                 hex: "#6366f1" },
];
