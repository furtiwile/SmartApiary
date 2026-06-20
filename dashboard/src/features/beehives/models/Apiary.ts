/** Backend DTO for a single Apiary */
export type ApiaryDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  beekeeperId: string;
  description: string;
  imageFileUrl?: string;
};

export type CreateApiaryPayload = {
  Name: string;
  Latitude: number;
  Longitude: number;
  Description: string;
  ImageFile: File;
};
