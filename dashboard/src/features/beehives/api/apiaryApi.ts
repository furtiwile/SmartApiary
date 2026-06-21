import api from "../../../config/api";
import axios from "axios";
import type { Apiary } from "../models/Apiary";

const APIARY_PATH = "/api/Apiaries"



export const ApiaryApi = {
  async getAll() : Promise<Apiary[] | null> {
    try {
      console.log(`Sending request to apiary API (GET): ${APIARY_PATH}`);
      const data = await api.get(APIARY_PATH);
      console.log("fetched data: ", data);
      return data.data.data; // ofc
    }
    catch (error) {
      console.log(`Error while sending request to apiary API: ${APIARY_PATH}`);
      console.error(error);
      let msg = "Unknown error occured while getting all apiaries";
      if (axios.isAxiosError(error))
        msg ??= error.response?.data?.message;
      console.error(msg);
      return null;
    }
  },



  async getAllByBeekeeper(beekeeperId: number) : Promise<Apiary[] | null> {
    const apiaries = await this.getAll();
    if (!apiaries)
      return null;
    return apiaries.filter(x => x.beekeeperId == beekeeperId);
  },



  async create(name: string, latitude: number, longitude: number, description: string, imageFile: File) : Promise<any> {
    const form = new FormData();
    form.append("name", name);
    form.append("latitude", `${latitude}`);
    form.append("longitude", `${longitude}`);
    form.append("description", description);
    form.append("imageFile", imageFile);

    try {
      console.log(`Sending request to apiary API (POST): ${APIARY_PATH}`);
      const data = await api.post(APIARY_PATH, form);
      console.log("fetched data: ", data);
      return data.data;
    }
    catch (error) {
      console.log(`Error while sending request to apiary API: ${APIARY_PATH}`);
      console.error(error);
      let msg = "Unknown error occured while getting all apiaries";
      if (axios.isAxiosError(error))
        msg ??= error.response?.data?.message;
      console.error(msg);
      return null;
    }
  }
} as const;
