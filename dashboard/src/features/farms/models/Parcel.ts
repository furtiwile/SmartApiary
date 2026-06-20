// Backend DTO from GetParcelsByFarmerQuery
export type ParcelDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  farmerId: string;
};
