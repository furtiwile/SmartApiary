import api from "../../../config/api";
import axios from "axios";
import type { Beehive } from "../models/Beehive";
import type { BeehiveType } from "../../../types/BeehiveType";

const BEEHIVE_PATH = "/api/Hives"



export const BeehiveApi = {
  async getByApiaryId(apiaryId: string) : Promise<Beehive[] | null> {
    const PATH = `${BEEHIVE_PATH}?apiaryId=${apiaryId}`;
    try {
      console.log(`Sending request to beehive API (GET): ${PATH}`);
      const data = await api.get(PATH);
      console.log("fetched data: ", data);
      return data.data.data; // ofc (2)
    }
    catch (error) {
      console.log(`Error while sending request to beehive API: ${PATH}`);
      console.error(error);
      let msg = "Unknown error occured while getting all hives";
      if (axios.isAxiosError(error))
        msg ??= error.response?.data?.message;
      console.error(msg);
      return null;
    }
  },



  async create(apiaryId: string, type: BeehiveType, designation: string, superColor: string, queenAge: number, note: string, smartScaleId: strinig) {
    const PATH = `${BEEHIVE_PATH}`;
    const payload = { apiaryId, type, designation, superColor, queenAge, note, smartScaleId };
    console.log(payload);
    try {
      console.log(`Sending request to beehive API (GET): ${PATH}`);
      const data = await api.post(PATH, payload);
      console.log("fetched data: ", data);
      return data.data.data; // ofc (2)
    }
    catch (error) {
      console.log(`Error while sending request to beehive API: ${PATH}`);
      console.error(error);
      let msg = "Unknown error occured while getting all hives";
      if (axios.isAxiosError(error))
        msg ??= error.response?.data?.message;
      console.error(msg);
      return null;
    }
  }
} as const;
