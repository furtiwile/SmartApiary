import api from "../../../config/api";

export type WeatherResultDto = {
  windSpeed: number;
  precipitation: number;
  description: string;
};

export type CropNearApiaryDto = {
  cropId: string;
  cropType: string;
  expectedFloweringTime: string;
  note: string;
  parcelId: string;
  parcelName: string;
  latitude: number;
  longitude: number;
  farmerName: string;
  farmerContact: string;
};

export class GeoApi {
  static async getWeather(latitude: number, longitude: number): Promise<WeatherResultDto | null> {
    try {
      const res = await api.get<{ data: WeatherResultDto }>(`/geo/weather?latitude=${latitude}&longitude=${longitude}`);
      return res.data?.data ?? null;
    } catch (e) {
      console.error("Error fetching weather:", e);
      return null;
    }
  }

  static async getCropsNearApiaries(radiusKm = 5): Promise<CropNearApiaryDto[]> {
    try {
      const res = await api.get<{ data: CropNearApiaryDto[] }>(`/geo/crops-near-apiaries?radiusKm=${radiusKm}`);
      return res.data?.data ?? [];
    } catch (e) {
      console.error("Error fetching crops near apiaries:", e);
      return [];
    }
  }
}
