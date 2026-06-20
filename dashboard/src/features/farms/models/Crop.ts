export type CropType = "Sunflower" | "Rapeseed" | "Lavender" | "Clover" | "Acacia" | "Other";

export type CropDto = {
  id: string;
  parcelId: string;
  cropType: CropType;
  expectedBloomDate: string; // ISO date string
  notes?: string;
};

export type CreateCropPayload = {
  parcelId: string;
  cropType: CropType;
  expectedBloomDate: string;
  notes?: string;
};

export const CROP_OPTIONS: { value: CropType; label: string; emoji: string }[] = [
  { value: "Sunflower",  label: "Sunflower",  emoji: "🌻" },
  { value: "Rapeseed",   label: "Rapeseed",   emoji: "🌼" },
  { value: "Lavender",   label: "Lavender",   emoji: "💜" },
  { value: "Clover",     label: "Clover",     emoji: "🍀" },
  { value: "Acacia",     label: "Acacia",     emoji: "🌿" },
  { value: "Other",      label: "Other",      emoji: "🌱" },
];
