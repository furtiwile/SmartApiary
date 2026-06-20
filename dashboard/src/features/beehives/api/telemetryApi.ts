import api from "../../../config/api";
import type { TelemetryReading } from "../models/Telemetry";
import type { InspectionEntry, CreateInspectionPayload } from "../models/Inspection";

// ─── Telemetry API ──────────────────────────────────────────────────────────

export class TelemetryApi {
  /** Fetch historical telemetry readings for a hive (last N hours) */
  static async getByHive(hiveId: string, hours = 48): Promise<TelemetryReading[]> {
    try {
      const res = await api.get<{ data: TelemetryReading[] }>(
        `/telemetry?hiveId=${hiveId}&hours=${hours}`
      );
      return res.data?.data ?? [];
    } catch (e) {
      console.error("Error fetching telemetry:", e);
      return [];
    }
  }

  /** Fetch the latest single reading for a hive (status card) */
  static async getLatest(hiveId: string): Promise<TelemetryReading | null> {
    try {
      const res = await api.get<{ data: TelemetryReading }>(`/telemetry/${hiveId}/latest`);
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
      const res = await api.get<{ data: InspectionEntry[] }>(`/inspections?hiveId=${hiveId}`);
      return res.data?.data ?? [];
    } catch (e) {
      console.error("Error fetching inspections:", e);
      return [];
    }
  }

  /** Log a new inspection entry */
  static async create(payload: CreateInspectionPayload): Promise<InspectionEntry | null> {
    try {
      const res = await api.post<{ data: InspectionEntry }>("/inspections", payload);
      return res.data?.data ?? null;
    } catch (e) {
      console.error("Error creating inspection:", e);
      return null;
    }
  }

  /** Delete an inspection entry */
  static async delete(inspectionId: string): Promise<boolean> {
    try {
      await api.delete(`/inspections/${inspectionId}`);
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
   * POST /hives/{hiveId}/pair  { serialNumber: "SA-YYYY-XXXXX" }
   */
  static async pair(hiveId: string, serialNumber: string): Promise<boolean> {
    try {
      await api.post(`/hives/${hiveId}/pair`, { serialNumber });
      return true;
    } catch (e) {
      console.error("Error pairing device:", e);
      return false;
    }
  }

  /**
   * Unpair / remove SmartScale from a hive.
   * DELETE /hives/{hiveId}/pair
   */
  static async unpair(hiveId: string): Promise<boolean> {
    try {
      await api.delete(`/hives/${hiveId}/pair`);
      return true;
    } catch (e) {
      console.error("Error unpairing device:", e);
      return false;
    }
  }
}
