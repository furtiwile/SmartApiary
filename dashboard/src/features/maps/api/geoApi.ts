import api from "../../../config/api";

export type WeatherResultDto = {
  windSpeed: number;
  precipitation: number;
  description: string;
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
}
