import api from "../../../config/api";
import type { TelemetryReading } from "../models/Telemetry";
import type { InspectionEntry, CreateInspectionPayload } from "../models/Inspection";

export class TelemetryApi {
  static async getBySmartScale(smartScaleId: string, hours = 48): Promise<TelemetryReading[]> {
    try {
      const res = await api.get<{ data: TelemetryReading[] }>(
        `/telemetry?smartScaleId=${smartScaleId}&hours=${hours}`
      );
      return res.data?.data ?? [];
    } catch (e) {
      console.error("Error fetching telemetry:", e);
      return [];
    }
  }

  static async getLatest(smartScaleId: string): Promise<TelemetryReading | null> {
    try {
      const res = await api.get<{ data: TelemetryReading }>(`/telemetry/latest?smartScaleId=${smartScaleId}`);
      return res.data?.data ?? null;
    } catch (e) {
      console.error("Error fetching latest telemetry:", e);
      return null;
    }
  }
}

export class InspectionApi {
  static async getByHive(hiveId: string): Promise<InspectionEntry[]> {
    try {
      const res = await api.get<{ data: Record<string, unknown>[] }>(`/hiveinspections?hiveId=${hiveId}`);
      return (res.data?.data ?? []).map((item) => ({
        id: item.id as string,
        hiveId: item.hiveId as string,
        inspectedAt: item.inspectionDate as string,
        boardColor: item.bottomBoardColor as string,
        framesOfHoney: item.honeyFrames as number,
        honeyKg: item.honeyAmount as number,
        framesOfBrood: item.broodFrames as number,
        queenSeen: item.queenPresent as boolean,
        notes: item.note as string,
      }));
    } catch (e) {
      console.error("Error fetching inspections:", e);
      return [];
    }
  }

  static async create(payload: CreateInspectionPayload): Promise<InspectionEntry | null> {
    try {
      const backendPayload = {
        hiveId: payload.hiveId,
        inspectionDate: new Date(payload.inspectedAt).toISOString(),
        bottomBoardColor: payload.boardColor || "Unknown",
        honeyFrames: payload.framesOfHoney || 0,
        honeyAmount: payload.honeyKg || 0,
        broodFrames: payload.framesOfBrood || 0,
        queenPresent: payload.queenSeen,
        note: payload.notes || ""
      };
      const res = await api.post<{ id: string }>("/hiveinspections", backendPayload);
      const id = res.data?.id;
      if (id) {
        return {
          id,
          ...payload
        };
      }
      return null;
    } catch (e) {
      console.error("Error creating inspection:", e);
      return null;
    }
  }

  static async delete(inspectionId: string, hiveId: string): Promise<boolean> {
    try {
      await api.delete(`/hiveinspections/${inspectionId}?hiveId=${hiveId}`);
      return true;
    } catch (e) {
      console.error("Error deleting inspection:", e);
      return false;
    }
  }
}

export class DevicePairingApi {
  static async pair(apiaryId: string, hiveId: string, serialNumber: string): Promise<boolean> {
    try {
      await api.post(`/smartscales/register`, { apiaryId, hiveId, serialNumber });
      return true;
    } catch (e) {
      console.error("Error pairing device:", e);
      return false;
    }
  }

  static async unpair(hiveId: string): Promise<boolean> {
    try {
      await api.delete(`/smartscales/unpair/${hiveId}`);
      return true;
    } catch (e) {
      console.error("Error unpairing device:", e);
      return false;
    }
  }
}