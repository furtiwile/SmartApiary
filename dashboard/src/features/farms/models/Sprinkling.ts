export type SprinklingStatus = "Scheduled" | "Completed" | "Cancelled" | "Postponed";

export type SprinklingAnnouncementDto = {
  id: string;
  parcelId: string;
  parcelName?: string;
  pesticideType: string;
  scheduledAt: string;      // ISO datetime
  durationMinutes: number;
  status: SprinklingStatus;
  beekeepersNotified?: number;
  notes?: string;
  createdAt: string;
};

export type CreateSprinklingPayload = {
  parcelId: string;
  pesticideType: string;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
};

/** Returned by the backend after creation — tells the farmer how many beekeepers were alerted */
export type CreateSprinklingResult = {
  announcement: SprinklingAnnouncementDto;
  beekeepersNotified: number;
  weatherWarning?: string;
};

export type SprinklingRecord = {
  id: string;
  announcementId: string;
  parcelId: string;
  parcelName?: string;
  pesticideType: string;
  executedAt: string;
  durationMinutes: number;
  weatherConditions?: string;
};
