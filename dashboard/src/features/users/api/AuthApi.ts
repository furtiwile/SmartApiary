import axios from "axios";
import api from "../../../config/api";

import type { AuthResult } from "../models/AuthResult";
import type { LoginData, AdminCreateData, ActivateData, ForgotPasswordData, ResetPasswordData } from "../models/AuthData";
import type { UserRole } from "../models/UserRole";

const AUTH_PATH = "/api/Auth";

async function tryFetchFromAuthAPI<T>(subpath: string, errMsg: string, data: T): Promise<AuthResult> {
  try {
    console.log(`Sending request to auth API: ${AUTH_PATH}${subpath}`);
    return (await api.post<AuthResult>(`${AUTH_PATH}${subpath}`, data)).data;
  }
  catch (error) {
    console.log(`Error while sending request to auth API: ${AUTH_PATH}${subpath}`);
    console.error(error);
    let msg = errMsg;
    if (axios.isAxiosError(error))
      msg ??= error.response?.data?.message;
    console.error(msg);
    return {
      success: false,
      message: msg,
      data: undefined,
    };
  }
}

export const AuthApi = {
  async login(email: string, password: string): Promise<AuthResult> {
    return await tryFetchFromAuthAPI<LoginData>(
      "/login",
      "Unknown error occured while logging in.",
      { email, password }
    );
  },

  async register(email: string, firstName: string, lastName: string, phoneNumber: string, role: UserRole): Promise<AuthResult> {
    return await tryFetchFromAuthAPI<AdminCreateData>(
      "/admin-create",
      "Unknown error occured while registering.",
      { email, firstName, lastName, phoneNumber, role }
    );
  },

  async activate(token: string, password: string): Promise<AuthResult> {
    return await tryFetchFromAuthAPI<ActivateData>(
      "/activate",
      "Unknown error occured while activating the account.",
      { token, password }
    );
  },

  async forgotPassword(email: string): Promise<AuthResult> {
    return await tryFetchFromAuthAPI<ForgotPasswordData>(
      "/forgot-password",
      "Unknown error occured while requesting password reset.",
      { email }
    );
  },

  async resetPassword(token: string, password: string): Promise<AuthResult> {
    return await tryFetchFromAuthAPI<ResetPasswordData>(
      "/reset-password",
      "Unknown error occured while resetting the password.",
      { token, password }
    );
  },
} as const;
