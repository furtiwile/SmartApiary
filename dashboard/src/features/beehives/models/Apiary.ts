/** Backend DTO for a single Apiary */
export type ApiaryDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  beekeeperId?: string;
};

export type CreateApiaryPayload = {
  Name: string;
  Latitude: number;
  Longitude: number;
  Description: string;
  ImageFile: File;
};
