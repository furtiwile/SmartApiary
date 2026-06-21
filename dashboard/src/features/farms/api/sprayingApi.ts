import api from "../../../config/api";
import type { CropDto, CreateCropPayload } from "../models/Crop";
import type {
  SprinklingAnnouncementDto,
  CreateSprinklingPayload,
  CreateSprinklingResult,
  SprinklingRecord,
  SprinklingStatus,
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
      const res = await api.post<{ id: string }>("/crops", payload);
      const id = res.data?.id;
      if (id) {
        return {
          id,
          ...payload,
          // Map backend expected property names to frontend DTO names for local cache
          cropType: payload.type as unknown as CropDto["cropType"],
          expectedBloomDate: payload.expectedFloweringTime,
        } as unknown as CropDto;
      }
      return null;
    } catch (e) {
      console.error("Error creating crop:", e);
      return null;
    }
  }

  static async delete(cropId: string, parcelId?: string): Promise<boolean> {
    try {
      const url = parcelId ? `/crops/${cropId}?parcelId=${encodeURIComponent(parcelId)}` : `/crops/${cropId}`;
      await api.delete(url);
      return true;
    } catch (e) {
      console.error("Error deleting crop:", e);
      return false;
    }
  }
}

// ─── Sprinkling API ──────────────────────────────────────────────────────────

export type CreateSprinklingPayloadExtended = CreateSprinklingPayload & { bypassWeatherValidation?: boolean };

export class SprayingApi {
  static async getByParcel(parcelId: string): Promise<SprinklingAnnouncementDto[]> {
    try {
      const res = await api.get<{ data: Record<string, unknown>[] }>(
        `/sprinklingannouncements?parcelId=${parcelId}`
      );
      return (res.data?.data ?? []).map((dto: Record<string, unknown>) => {
        const start = new Date(dto.startTime as string);
        const durationHours = (dto.expectedDurationHours as number) ?? 1;
        const end = new Date(start.getTime() + durationHours * 3600 * 1000);
        const now = new Date();
        
        let status: SprinklingStatus = "Scheduled";
        if (dto.isCancelled) {
          status = "Cancelled";
        } else if (now > end) {
          status = "Completed";
        } else {
          status = "Scheduled";
        }

        return {
          id: dto.id as string,
          parcelId: dto.parcelId as string,
          pesticideType: (dto.preparationType as string) ?? "",
          scheduledAt: dto.startTime as string,
          durationMinutes: Math.round(durationHours * 60),
          status: status,
          beekeepersNotified: (dto.notifiedBeekeepersCount as number) ?? 0,
          createdAt: dto.startTime as string,
        };
      });
    } catch (e) {
      console.error("Error fetching sprinkling announcements:", e);
      return [];
    }
  }

  static async create(payload: CreateSprinklingPayloadExtended): Promise<CreateSprinklingResult | null> {
    try {
      const res = await api.post<{ id: string }>("/sprinklingannouncements", payload);
      const id = res.data?.id;
      if (id) {
        return {
          announcement: {
            id,
            parcelId: payload.parcelId,
            pesticideType: payload.preparationType,
            scheduledAt: payload.startTime,
            durationMinutes: payload.expectedDurationHours * 60,
            status: "Scheduled",
            createdAt: new Date().toISOString(),
          },
          beekeepersNotified: 0, // Backend notifies asynchronously
        };
      }
      return null;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string, error?: string } } };
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      console.error("Error creating sprinkling announcement:", e);
      return null;
    }
  }

  static async cancel(announcementId: string, parcelId: string): Promise<boolean> {
    try {
      await api.post(`/sprinklingannouncements/${announcementId}/cancel?parcelId=${parcelId}`);
      return true;
    } catch (e) {
      console.error("Error cancelling announcement:", e);
      return false;
    }
  }

  static async getRecordsByParcel(parcelId: string): Promise<SprinklingRecord[]> {
    try {
      const res = await api.get<{ data: Record<string, unknown>[] }>(
        `/sprinklingrecords?parcelId=${parcelId}`
      );
      return (res.data?.data ?? []).map((dto: Record<string, unknown>) => {
        const start = dto.actualStartTime ? new Date(dto.actualStartTime as string) : null;
        const end = dto.actualEndTime ? new Date(dto.actualEndTime as string) : null;
        const durationMs = start && end ? end.getTime() - start.getTime() : 0;
        const durationMinutes = durationMs > 0 ? Math.round(durationMs / 60000) : 0;
        return {
          id: dto.id as string,
          announcementId: dto.announcementId as string,
          parcelId: (dto.parcelId as string) || parcelId,
          parcelName: dto.parcelName as string,
          pesticideType: (dto.preparationType as string) ?? "",
          executedAt: (dto.actualStartTime as string) ?? new Date().toISOString(),
          durationMinutes: durationMinutes,
          weatherConditions: (dto.weatherCondition as string) ?? "",
        };
      });
    } catch (e) {
      console.error("Error fetching sprinkling records:", e);
      return [];
    }
  }

  static getExportUrl(parcelId: string, fromDate?: string, toDate?: string): string {
    const params = new URLSearchParams();
    params.append("parcelId", parcelId);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    return `${api.defaults.baseURL}/sprinklingrecords/export?${params.toString()}`;
  }

  static async exportRecordsPdf(parcelId: string, fromDate?: string, toDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    params.append("parcelId", parcelId);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    
    const res = await api.get(`/sprinklingrecords/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return res.data;
  }
}
