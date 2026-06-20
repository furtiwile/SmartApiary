import api from "../../../config/api";
import type { CropDto, CreateCropPayload } from "../models/Crop";
import type {
  SprinklingAnnouncementDto,
  CreateSprinklingPayload,
  CreateSprinklingResult,
  SprinklingRecord,
} from "../models/Sprinkling";

// ─── Crop API ────────────────────────────────────────────────────────────────

export class CropApi {
  static async getByParcel(parcelId: string): Promise<CropDto[]> {
    try {
      const res = await api.get<{ data: CropDto[] }>(`/crops?parcelId=${parcelId}`);
      return res.data?.data ?? [];
    } catch (e) {
      console.error("Error fetching crops:", e);
      return [];
    }
  }

  static async create(payload: CreateCropPayload): Promise<CropDto | null> {
    try {
      const res = await api.post<{ data: CropDto }>("/crops", payload);
      return res.data?.data ?? null;
    } catch (e) {
      console.error("Error creating crop:", e);
      return null;
    }
  }

  static async delete(cropId: string): Promise<boolean> {
    try {
      await api.delete(`/crops/${cropId}`);
      return true;
    } catch (e) {
      console.error("Error deleting crop:", e);
      return false;
    }
  }
}

// ─── Sprinkling API ──────────────────────────────────────────────────────────

export class SprayingApi {
  static async getByParcel(parcelId: string): Promise<SprinklingAnnouncementDto[]> {
    try {
      const res = await api.get<{ data: SprinklingAnnouncementDto[] }>(
        `/sprinklingannouncements?parcelId=${parcelId}`
      );
      return res.data?.data ?? [];
    } catch (e) {
      console.error("Error fetching sprinkling announcements:", e);
      return [];
    }
  }

  static async create(payload: CreateSprinklingPayload): Promise<CreateSprinklingResult | null> {
    try {
      const res = await api.post<{ data: CreateSprinklingResult }>("/sprinklingannouncements", payload);
      return res.data?.data ?? null;
    } catch (e) {
      console.error("Error creating sprinkling announcement:", e);
      return null;
    }
  }

  static async cancel(announcementId: string): Promise<boolean> {
    try {
      await api.patch(`/sprinklingannouncements/${announcementId}/cancel`);
      return true;
    } catch (e) {
      console.error("Error cancelling announcement:", e);
      return false;
    }
  }

  static async getRecordsByParcel(parcelId: string): Promise<SprinklingRecord[]> {
    try {
      const res = await api.get<{ data: SprinklingRecord[] }>(
        `/sprinklingrecords?parcelId=${parcelId}`
      );
      return res.data?.data ?? [];
    } catch (e) {
      console.error("Error fetching sprinkling records:", e);
      return [];
    }
  }
}
