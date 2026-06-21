export type DataToken = {
  token: string;
}

export type AuthResult<TData = unknown> = {
  success: boolean;
  message: string;
  data?: TData;
};
