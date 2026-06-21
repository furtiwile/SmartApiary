import type { UserRole } from "./UserRole";

export type UserDto = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}