import { createContext, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

import type { AuthContextData } from "../models/AuthContextData";
import type { UserDto } from "../models/UserDto";

import { LocalStorage } from "../helpers/localStorageHelper";
import { useNotificationStore } from "../../../hooks/useNotificationStore";



const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface JwtPayload {
  sub?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
  ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?: string;
  [key: string]: unknown;
}

function decodeJWT(token: string): UserDto | null {
  let decoded: JwtPayload;
  try {
    decoded = jwtDecode<JwtPayload>(token);
  }
  catch (error) {
    console.error("Error when decoding JWT token", error);
    return null;
  }

  if (!decoded.sub || !decoded.email)
    return null;

  const rawRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const role = rawRole === "Admin" || rawRole === "Farmer" || rawRole === "Beekeeper"
    ? rawRole
    : "Unknown";

  return {
    id: decoded.sub,
    email: decoded.email,
    firstName: decoded.given_name ?? "",
    lastName: decoded.family_name ?? "",
    phoneNumber: "",
    role,
  };
}



function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    // Danger: use of Date methods
    const currTime = Date.now() / 1_000;

    if (!decoded.exp)
      return false;
    return decoded?.exp < currTime;
  }
  catch (error) {
    console.warn("some kind of error occured when checking if token expired: ", error);
    return true;
  }
}

// I don't know why this "xyzComponentProps" fuckery
// is always needed in a not-lambda style
interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
  const clearNotifications = useNotificationStore((state) => state.clear);

  const [user, setUser] = useState<UserDto | null>(() => {
    const savedToken = LocalStorage.get("authToken");
    if (savedToken && !isTokenExpired(savedToken)) {
      const claims = decodeJWT(savedToken);
      if (claims) return claims;
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedToken = LocalStorage.get("authToken");
    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        LocalStorage.remove("authToken");
        return null;
      }
      const claims = decodeJWT(savedToken);
      if (claims) return savedToken;
      LocalStorage.remove("authToken");
    }
    return null;
  });

  const isLoading = false;

  function login(newToken: string) {
    const claims = decodeJWT(newToken);

    if (!claims || isTokenExpired(newToken)) {
      console.error("Invalid or expired token");
      return;
    }
    toast.dismiss();
    clearNotifications();
    setToken(newToken);
    setUser(claims);
    LocalStorage.save("authToken", newToken);
  }

  function logout() {
    toast.dismiss();
    clearNotifications();
    setToken(null);
    setUser(null);
    LocalStorage.remove("authToken");
  }

  const isAuthed = !!user && !!token;
  const value: AuthContextData = { user, token, login, logout, isAuthed, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
