import type { UserDto } from "./UserDto";



export type AuthContextData = {
  user: UserDto | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthed: boolean;
  isLoading: boolean;
}