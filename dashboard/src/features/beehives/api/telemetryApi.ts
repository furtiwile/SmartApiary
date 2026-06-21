import api from "../../../config/api";
import type { TelemetryReading } from "../models/Telemetry";
import type { InspectionEntry, CreateInspectionPayload } from "../models/Inspection";

// ─── Telemetry API ──────────────────────────────────────────────────────────

export class TelemetryApi {
  /** Fetch historical telemetry readings for a smart scale (last N hours) */
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

  /** Fetch the latest single reading for a smart scale (status card) */
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

// ─── Inspection (Hive Diary) API ────────────────────────────────────────────

export class InspectionApi {
  /** Fetch all inspections for a hive, ordered by date desc */
  static async getByHive(hiveId: string): Promise<InspectionEntry[]> {
    try {
      const res = await api.get<{ data: any[] }>(`/hiveinspections?hiveId=${hiveId}`);
      return (res.data?.data ?? []).map((item: any) => ({
        id: item.id,
        hiveId: item.hiveId,
        inspectedAt: item.inspectionDate,
        boardColor: item.bottomBoardColor,
        framesOfHoney: item.honeyFrames,
        honeyKg: item.honeyAmount,
        framesOfBrood: item.broodFrames,
        queenSeen: item.queenPresent,
        notes: item.note,
      }));
    } catch (e) {
      console.error("Error fetching inspections:", e);
      return [];
    }
  }

  /** Log a new inspection entry */
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

  /** Delete an inspection entry */
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

// ─── Device Pairing API ─────────────────────────────────────────────────────

export class DevicePairingApi {
  /**
   * Pair a SmartScale device to a hive by serial number.
   * POST /smartscales/register  { apiaryId, hiveId, serialNumber }
   */
  static async pair(apiaryId: string, hiveId: string, serialNumber: string): Promise<boolean> {
    try {
      await api.post(`/smartscales/register`, { apiaryId, hiveId, serialNumber });
      return true;
    } catch (e) {
      console.error("Error pairing device:", e);
      return false;
    }
  }

  /**
   * Unpair / remove SmartScale from a hive.
   * DELETE /smartscales/unpair/{hiveId}
   */
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
