import axios from "axios";

import type { AuthResult } from "../models/AuthResult";
import type { LoginData, RegisterData } from "../models/AuthData";
import type { UserRole } from "../models/UserRole";

// TODO: Get the actual auth URL
const API_URL = import.meta.env.VITE_API_URL + "auth";



async function tryFetchFromAuthAPI<T>(subpath: string, errMsg: string, data: T) : Promise<AuthResult> {
  subpath = subpath.substring(subpath.indexOf('/') + 1);
  
  try {
    return (await axios.post<AuthResult>(`${API_URL}/${subpath}`,
      {...data}
    )).data;
  }
  catch (error) {
    let msg = errMsg;
    if (axios.isAxiosError(error))
      msg ??= error.response?.data?.message;
    console.error(msg);
    return {
      success: false,
      msg: msg,
      data: undefined,
    };
  }
}



export const AuthApi = {
  async login(email: string, password: string): Promise<AuthResult> {
    return await tryFetchFromAuthAPI<LoginData>(
      "/login",
      "Unknown error occured while logging in.",
      {email: email, password: password}
    );
  },



  async register(email: string, password: string, firstName: string, lastName: string, phoneNumber: string, role: UserRole): Promise<AuthResult> {
    return await tryFetchFromAuthAPI<RegisterData>(
      "/register",
      "Unknown error occured while registering.",
      {email: email, password: password, firstName: firstName, lastName: lastName, phoneNumber: phoneNumber, role: role}
    );
  }
} as const;
