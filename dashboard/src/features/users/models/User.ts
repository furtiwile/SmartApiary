import type { UserRole } from "./UserRole";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  role: UserRole;
  isActive?: boolean; // default: true
}
