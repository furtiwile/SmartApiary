import api from "../../../config/api";
import type { Beehive } from "../models/Beehive";

type BeehiveResponse = Partial<Beehive> & {
  Id?: string;
  ApiaryId?: string;
  Name?: string;
  Designation?: string;
  Type?: Beehive["type"];
  SuperColor?: string;
  QueenAge?: number;
  Note?: string;
  SmartScaleId?: string;
};

function normalizeBeehive(hive: BeehiveResponse): Beehive {
  const designation = hive.designation ?? hive.Designation ?? hive.name ?? hive.Name ?? "";

  return {
    id: hive.id ?? hive.Id ?? "",
    apiaryId: hive.apiaryId ?? hive.ApiaryId,
    name: hive.name ?? hive.Name ?? designation,
    designation,
    type: (hive.type ?? hive.Type) as Beehive["type"],
    superColor: hive.superColor ?? hive.SuperColor,
    queenAge: hive.queenAge ?? hive.QueenAge,
    note: hive.note ?? hive.Note,
    smartScaleId: hive.smartScaleId ?? hive.SmartScaleId,
  };
}

export type CreateBeehivePayload = {
  apiaryId: string;
  designation: string;
  type: string;
  superColor: string;
  queenAge: number;
  note: string;
  smartScaleId?: string;
};

export type UpdateBeehivePayload = Partial<CreateBeehivePayload> & { id: string };

/**
 * Beehive API client — fully implemented with real axios calls.
 * Previously all methods were stubbed and returned hardcoded empty values.
 */
export class BeehiveApi {
  /** Fetch all hives (for admin or beekeeper-global views) */
  static async getAll(): Promise<Beehive[]> {
    try {
      const response = await api.get<{ data: BeehiveResponse[] }>("/hives");
      return (response.data?.data ?? []).map(normalizeBeehive);
    } catch (error) {
      console.error("Error fetching all beehives:", error);
      return [];
    }
  }

  /** Fetch all hives belonging to a specific apiary */
  static async getByApiaryId(apiaryId: string): Promise<Beehive[]> {
    try {
      const response = await api.get<{ data: BeehiveResponse[] }>(`/hives?apiaryId=${apiaryId}`);
      return (response.data?.data ?? []).map(normalizeBeehive);
    } catch (error) {
      console.error(`Error fetching beehives for apiary ${apiaryId}:`, error);
      return [];
    }
  }

  /** Fetch a single hive by its ID */
  static async getById(id: string): Promise<Beehive | null> {
    try {
      const response = await api.get<{ data: BeehiveResponse }>(`/hives/${id}`);
      return response.data?.data ? normalizeBeehive(response.data.data) : null;
    } catch (error) {
      console.error(`Error fetching beehive ${id}:`, error);
      return null;
    }
  }

  /** Create a new hive within an apiary */
  static async create(payload: CreateBeehivePayload): Promise<Beehive | null> {
    try {
      const response = await api.post<{ id: string }>("/hives", payload);
      const id = response.data?.id;
      if (id) {
        const hives = await this.getByApiaryId(payload.apiaryId);
        return hives.find((hive) => hive.id === id) ?? normalizeBeehive({ id, ...payload, type: payload.type as Beehive["type"] });
      }
      return null;
    } catch (error) {
      console.error("Error creating beehive:", error);
      return null;
    }
  }

  /** Update an existing hive's properties */
  static async update(payload: UpdateBeehivePayload): Promise<Beehive | null> {
    try {
      const response = await api.put<{ data: BeehiveResponse }>(`/hives/${payload.id}`, payload);
      return response.data?.data ? normalizeBeehive(response.data.data) : null;
    } catch (error) {
      console.error(`Error updating beehive ${payload.id}:`, error);
      return null;
    }
  }

  /** Delete a hive by ID */
  static async delete(beehiveId: string): Promise<boolean> {
    try {
      await api.delete(`/hives/${beehiveId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting beehive ${beehiveId}:`, error);
      return false;
    }
  }
}
