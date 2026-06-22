import api from "../../../config/api";

export interface UserSettings {
  weightDropThreshold: number;
}

export const usersApi = {
  getSettings: async (): Promise<UserSettings> => {
    const response = await api.get<{ data: UserSettings }>("/users/settings");
    return response.data?.data;
  },

  updateSettings: async (settings: UserSettings): Promise<void> => {
    await api.put("/users/settings", settings);
  },
};
