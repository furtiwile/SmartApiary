import api from "../../../config/api";
import axios from "axios";
import type { BeehiveInspection } from "../models/BeehiveInspection";

const BEEHIVE_INSPECTION_PATH = "/api/HiveInspections"



export const BeehiveInspectionApi = {
  async getByHiveId(hiveId: number | string) : Promise<BeehiveInspection[] | null> {
    try {
      console.log(`Sending request to beehive inspection API (GET): ${BEEHIVE_INSPECTION_PATH}?hiveId=${hiveId}`);
      const data = await api.get(BEEHIVE_INSPECTION_PATH);
      console.log("fetched data: ", data);
      return data.data.data; // ofc (3)
    }
    catch (error) {
      console.log(`Error while sending request to beehive inspection API: ${BEEHIVE_INSPECTION_PATH}`);
      console.error(error);
      let msg = "Unknown error occured while getting all inspections";
      if (axios.isAxiosError(error))
        msg ??= error.response?.data?.message;
      console.error(msg);
      return null;
    }
  },



  async create(
    hiveId: string,
    inspectionDate: Date,
    bottomBoardColor: string,
    honeyFrames: number,
    honeyAmount: number,
    broodFrames: number,
    queenPresent: boolean,
    note: string
  )
  {
    const PATH = `${BEEHIVE_INSPECTION_PATH}`;
    const payload = { hiveId, inspectionDate, bottomBoardColor, honeyFrames, honeyAmount, broodFrames, queenPresent, note };
    console.log(payload);
    try {
      console.log(`Sending request to beehive API (GET): ${PATH}`);
      const data = await api.post(PATH, payload);
      console.log("fetched data: ", data);
      return data.data.data; // ofc (3)
    }
    catch (error) {
      console.log(`Error while sending request to inspection API: ${PATH}`);
      console.error(error);
      let msg = "Unknown error occured while getting all hiinspectionses";
      if (axios.isAxiosError(error))
        msg ??= error.response?.data?.message;
      console.error(msg);
      return null;
    }
  }
} as const;
