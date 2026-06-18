export type DataToken = {
  token: string;
}

export type AuthResult = {
  success: boolean;
  message: string;
  data?: DataToken;
};
