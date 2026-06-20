import api from "../../../config/api";
import type { ParcelDto } from "../models/Parcel";

export class FarmApi {
  static async getParcelsByFarmer(farmerId: string): Promise<ParcelDto[]> {
    try {
      const response = await api.get<{ data: ParcelDto[] }>(`/parcels?farmerId=${farmerId}`);
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Error fetching parcels:", error);
      return [];
    }
  }

  static async createParcel(parcel: Omit<ParcelDto, "id">): Promise<ParcelDto | null> {
    try {
      const response = await api.post<{ data: ParcelDto }>("/parcels", parcel);
      return response.data?.data ?? null;
    } catch (error) {
      console.error("Error creating parcel:", error);
      return null;
    }
  }

  static async updateParcel(parcel: ParcelDto): Promise<ParcelDto | null> {
    try {
      const response = await api.put<{ data: ParcelDto }>(`/parcels/${parcel.id}`, parcel);
      return response.data?.data ?? null;
    } catch (error) {
      console.error("Error updating parcel:", error);
      return null;
    }
  }

  static async deleteParcel(parcelId: string): Promise<boolean> {
    try {
      await api.delete(`/parcels/${parcelId}`);
      return true;
    } catch (error) {
      console.error("Error deleting parcel:", error);
      return false;
    }
  }
}
