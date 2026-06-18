import type { UserRole } from "./UserRole";

export type LoginData = {
  email: string;
  password: string;
};

export type AdminCreateData = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
};

export type ActivateData = {
  token: string;
  password: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  token: string;
  password: string;
};
