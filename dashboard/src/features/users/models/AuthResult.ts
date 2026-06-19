export type DataToken = {
  token: string;
}

export type AdminCreateDataResult = {
  userId: string;
  activationLink?: string;
}

export type AdminCreateSuccessResult = {
  message: string;
  data: AdminCreateDataResult;
}

export type AdminCreateFailureResult = {
  type: "Failure" | string;
  errors: unknown | null;
  message: string;
}

export type AdminCreateResult = AdminCreateSuccessResult | AdminCreateFailureResult;

export function isAdminCreateFailure(result: AdminCreateResult): result is AdminCreateFailureResult {
  return "type" in result;
}

export type ActivateSuccessResult = {
  message: string;
}

export type ActivateFailureResult = {
  type: "Failure" | string;
  errors: unknown | null;
  message: string;
}

export type ActivateResult = ActivateSuccessResult | ActivateFailureResult;

export function isActivateFailure(result: ActivateResult): result is ActivateFailureResult {
  return "type" in result;
}

export type AuthResult = {
  success: boolean;
  message: string;
  data?: DataToken;
};
