import type { UserRole } from "./UserRole";



export type LoginData = {
  email: string;
  password: string;
}



export type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}
