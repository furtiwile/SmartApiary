/** Backend DTO for a single Apiary */
export type ApiaryDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  beekeeperId: string;
};

export type CreateApiaryPayload = {
  name: string;
  latitude: number;
  longitude: number;
};
