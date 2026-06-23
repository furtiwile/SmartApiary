export type CropType = "Sunflower" | "Rapeseed" | "Lavender" | "Linden" | "Acacia" | "Other";

export type CropDto = {
  id: string;
  parcelId: string;
  cropType: CropType;
  expectedBloomDate: string; // ISO date string
  notes?: string;
};

export type CreateCropPayload = {
  parcelId: string;
  type: CropType;
  expectedFloweringTime: string;
  note: string;
};

export const CROP_OPTIONS: { value: CropType; label: string; emoji: string }[] = [
  { value: "Sunflower",  label: "Sunflower",  emoji: "🌻" },
  { value: "Rapeseed",   label: "Rapeseed",   emoji: "🌼" },
  { value: "Lavender",   label: "Lavender",   emoji: "💜" },
  { value: "Linden",     label: "Linden",     emoji: "🌳" },
  { value: "Acacia",     label: "Acacia",     emoji: "🌿" },
  { value: "Other",      label: "Other",      emoji: "🌱" },
];

export function hasExpectedBloomDatePassed(expectedBloomDate: string): boolean {
  const bloomDate = new Date(expectedBloomDate);
  const now = new Date();
  return bloomDate <= now;
}
