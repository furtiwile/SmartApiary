import axios from "axios";
import api from "../../../config/api";

import type { AuthResult } from "../models/AuthResult";
import type { LoginData, AdminCreateData, ActivateData, ForgotPasswordData, ResetPasswordData } from "../models/AuthData";
import type { UserDto } from "../models/UserDto";
import type { UserRole } from "../models/UserRole";

const AUTH_PATH = "/auth";

type ApiSuccessResponse<TData> = {
  success?: boolean;
  message?: string;
  data?: TData;
  resetLink?: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]> | string;
};

function formatErrors(errors: ApiErrorResponse["errors"]): string | undefined {
  if (!errors) return undefined;
  if (typeof errors === "string") return errors;

  return Object.values(errors)
    .flat()
    .filter(Boolean)
    .join(" ");
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const responseMessage = error.response?.data?.message;
  const validationMessage = formatErrors(error.response?.data?.errors);
  return validationMessage || responseMessage || fallback;
}

async function tryFetchFromAuthAPI<TPayload, TData = unknown>(
  subpath: string,
  errMsg: string,
  data: TPayload
): Promise<AuthResult<TData>> {
  try {
    console.log(`Sending request to auth API: ${AUTH_PATH}${subpath}`);
    const response = await api.post<ApiSuccessResponse<TData>>(`${AUTH_PATH}${subpath}`, data);
    return {
      success: response.data.success ?? true,
      message: response.data.message ?? "Operation successful.",
      data: response.data.data,
    };
  }
  catch (error) {
    console.log(`Error while sending request to auth API: ${AUTH_PATH}${subpath}`);
    console.error(error);
    const msg = getErrorMessage(error, errMsg);
    console.error(msg);
    return {
      success: false,
      message: msg,
      data: undefined,
    };
  }
}

export const AuthApi = {
  async login(email: string, password: string): Promise<AuthResult<{ token: string }>> {
    return await tryFetchFromAuthAPI<LoginData, { token: string }>(
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

  async getUsers(): Promise<UserDto[]> {
    try {
      const response = await api.get<{ data: UserDto[] }>(`${AUTH_PATH}/users`);
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  async suspendUser(userId: string): Promise<boolean> {
    try {
      await api.post(`${AUTH_PATH}/users/${userId}/suspend`);
      return true;
    } catch (error) {
      console.error(`Error suspending user ${userId}:`, error);
      return false;
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await api.delete(`${AUTH_PATH}/users/${userId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  },
} as const;
