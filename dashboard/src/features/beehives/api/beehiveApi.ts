import api from "../../../config/api";
import type { Beehive } from "../models/Beehive";

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
      const response = await api.get<{ data: Beehive[] }>("/hives");
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Error fetching all beehives:", error);
      return [];
    }
  }

  /** Fetch all hives belonging to a specific apiary */
  static async getByApiaryId(apiaryId: string): Promise<Beehive[]> {
    try {
      const response = await api.get<{ data: Beehive[] }>(`/hives?apiaryId=${apiaryId}`);
      return response.data?.data ?? [];
    } catch (error) {
      console.error(`Error fetching beehives for apiary ${apiaryId}:`, error);
      return [];
    }
  }

  /** Fetch a single hive by its ID */
  static async getById(id: string): Promise<Beehive | null> {
    try {
      const response = await api.get<{ data: Beehive }>(`/hives/${id}`);
      return response.data?.data ?? null;
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
        return {
          id,
          apiaryId: payload.apiaryId,
          name: payload.designation, // Frontend uses name, payload uses designation
          type: payload.type,
          superColor: payload.superColor,
          queenAge: payload.queenAge,
          note: payload.note,
          smartScaleId: payload.smartScaleId,
        };
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
      const response = await api.put<{ data: Beehive }>(`/hives/${payload.id}`, payload);
      return response.data?.data ?? null;
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
