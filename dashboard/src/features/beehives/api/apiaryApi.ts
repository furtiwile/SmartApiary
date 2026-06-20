import api from "../../../config/api";
import type { ApiaryDto, CreateApiaryPayload } from "../models/Apiary";

/**
 * Apiary API client.
 * Communicates with the backend /apiaries endpoint.
 */
export class ApiaryApi {
  /** Fetch all apiaries belonging to the current beekeeper */
  static async getByBeekeeper(beekeeperId: string): Promise<ApiaryDto[]> {
    try {
      const response = await api.get<{ data: ApiaryDto[] }>(`/apiaries?beekeeperId=${beekeeperId}`);
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Error fetching apiaries:", error);
      return [];
    }
  }

  /** Fetch a single apiary by ID */
  static async getById(id: string): Promise<ApiaryDto | null> {
    try {
      const response = await api.get<{ data: ApiaryDto }>(`/apiaries/${id}`);
      return response.data?.data ?? null;
    } catch (error) {
      console.error(`Error fetching apiary ${id}:`, error);
      return null;
    }
  }

  /** Create a new apiary for the current beekeeper */
  static async create(payload: CreateApiaryPayload): Promise<ApiaryDto | null> {
    try {
      const response = await api.postForm<{ id: string }>("/apiaries", payload);
      const id = response.data?.id;
      if (id) {
        return {
          id,
          name: payload.Name,
          latitude: payload.Latitude,
          longitude: payload.Longitude,
          description: payload.Description,
          imageUrl: URL.createObjectURL(payload.ImageFile),
          thumbnailUrl: URL.createObjectURL(payload.ImageFile),
          beekeeperId: "current_user",
        };
      }
      return null;
    } catch (error) {
      console.error("Error creating apiary:", error);
      return null;
    }
  }

  /** Delete an apiary by ID */
  static async delete(apiaryId: string): Promise<boolean> {
    try {
      await api.delete(`/apiaries/${apiaryId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting apiary ${apiaryId}:`, error);
      return false;
    }
  }
}
