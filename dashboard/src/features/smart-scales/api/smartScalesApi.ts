import api from "../../../config/api";
import { type SmartScale } from "../types";

export const smartScalesApi = {
  getUnpaired: async (): Promise<SmartScale[]> => {
    const response = await api.get<{ data: SmartScale[] }>("/smartscales/unpaired");
    return response.data?.data ?? [];
  },

  create: async (): Promise<string> => {
    const response = await api.post<{ data: string }>("/smartscales");
    return response.data?.data ?? "";
  },
};
