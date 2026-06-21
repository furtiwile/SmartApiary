import api from "../../../config/api";
import type { ApiaryDto, CreateApiaryPayload } from "../models/Apiary";

type ApiaryResponse = Partial<ApiaryDto> & {
  Id?: string;
  Name?: string;
  Latitude?: number;
  Longitude?: number;
  Description?: string;
  ImageUrl?: string;
  ThumbnailUrl?: string;
  BeekeeperId?: string;
  imageFileUrl?: string;
};

function normalizeApiary(apiary: ApiaryResponse): ApiaryDto {
  return {
    id: apiary.id ?? apiary.Id ?? "",
    name: apiary.name ?? apiary.Name ?? "",
    latitude: Number(apiary.latitude ?? apiary.Latitude ?? 0),
    longitude: Number(apiary.longitude ?? apiary.Longitude ?? 0),
    description: apiary.description ?? apiary.Description ?? "",
    imageUrl: apiary.imageUrl ?? apiary.ImageUrl ?? apiary.imageFileUrl ?? "",
    thumbnailUrl: apiary.thumbnailUrl ?? apiary.ThumbnailUrl ?? "",
    beekeeperId: apiary.beekeeperId ?? apiary.BeekeeperId,
  };
}

/**
 * Apiary API client.
 * Communicates with the backend /apiaries endpoint.
 */
export class ApiaryApi {
  /** Fetch all apiaries belonging to the current beekeeper */
  static async getByBeekeeper(): Promise<ApiaryDto[]> {
    try {
      const response = await api.get<{ data: ApiaryResponse[] }>("/apiaries");
      return (response.data?.data ?? []).map(normalizeApiary);
    } catch (error) {
      console.error("Error fetching apiaries:", error);
      return [];
    }
  }

  /** Fetch a single apiary by ID */
  static async getById(id: string): Promise<ApiaryDto | null> {
    try {
      const response = await api.get<{ data: ApiaryResponse }>(`/apiaries/${id}`);
      return response.data?.data ? normalizeApiary(response.data.data) : null;
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
        const apiaries = await this.getByBeekeeper();
        const created = apiaries.find((apiary) => apiary.id === id);
        if (created) return created;

        return {
          id,
          name: payload.Name,
          latitude: payload.Latitude,
          longitude: payload.Longitude,
          description: payload.Description,
          imageUrl: payload.ImageFile ? URL.createObjectURL(payload.ImageFile) : "",
          thumbnailUrl: payload.ImageFile ? URL.createObjectURL(payload.ImageFile) : "",
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
