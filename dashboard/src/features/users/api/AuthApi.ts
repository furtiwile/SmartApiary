import axios from "axios";
import api from "../../../config/api";

import type { AuthResult, AdminCreateResult, ActivateResult } from "../models/AuthResult";
import type { LoginData, AdminCreateData, ActivateData, ForgotPasswordData, ResetPasswordData } from "../models/AuthData";
import type { UserRole } from "../models/UserRole";

const AUTH_PATH = "/auth";

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

  async register(email: string, firstName: string, lastName: string, phoneNumber: string, role: Exclude<UserRole, "Unknown">): Promise<AdminCreateResult> {
    try {
      const payload: AdminCreateData = { email, firstName, lastName, phoneNumber, role };
      const response = (await api.post<AdminCreateResult>(`${AUTH_PATH}/admin-create`, payload)).data;

      return response;
    }
    catch (error) {
      let msg = "Unknown error occured while registering.";
      let errors: unknown | null = null;
      if (axios.isAxiosError(error))
      {
        msg = error.response?.data?.message ?? msg;
        errors = error.response?.data?.errors ?? null;
      }

      return {
        type: "Failure",
        errors,
        message: msg,
      };
    }
  },

  async activate(token: string, password: string): Promise<ActivateResult> {
    try {
      const payload: ActivateData = { token, password };
      return (await api.post<ActivateResult>(`${AUTH_PATH}/activate`, payload)).data;
    }
    catch (error) {
      let msg = "Unknown error occured while activating the account.";
      let errors: unknown | null = null;
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message ?? msg;
        errors = error.response?.data?.errors ?? null;
      }

      return {
        type: "Failure",
        errors,
        message: msg,
      };
    }
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
