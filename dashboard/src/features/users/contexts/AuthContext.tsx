import { createContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

import type { AuthContextData } from "../models/AuthContextData";
import type { UserDto } from "../models/UserDto";

import { LocalStorage } from "../helpers/localStorageHelper";



const AuthContext = createContext<AuthContextData | undefined>(undefined);



function decodeJWT(token: string): UserDto | null {
  let decoded: UserDto;
  try {
    decoded = jwtDecode<UserDto>(token);
  }
  catch (error) {
    console.error("Error when decoding JWT token", error);
    return null;
  }

  if (decoded.id <= 0 || !decoded.email)
    return null;

  return {
    id: decoded.id,
    email: decoded.email,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    phoneNumber: decoded.phoneNumber,
    role: decoded.role,
    // ...decoded
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
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: setState's are now "anti-pattern" as it seems.
  // If there is a better solution to prevent cascading renders
  // I guess it's going to be useMemo, but I'm too lazy to fix it
  useEffect(() => {
    const savedToken = LocalStorage.get("authToken");

    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        LocalStorage.remove("authToken");
        setIsLoading(false);
        return;
      }

      const claims = decodeJWT(savedToken);
      if (!claims)
        LocalStorage.remove("authToken");
      else {
        setToken(savedToken);
        setUser(claims);
      }
    }

    setIsLoading(false);
  }, []);

  function login(newToken: string) {
    const claims = decodeJWT(newToken);

    if (!claims || isTokenExpired(newToken)) {
      console.error("Invalid or expired token");
      return;
    }
    setToken(newToken);
    setUser(claims);
    LocalStorage.save("authToken", newToken);
  }

  function logout() {
    setToken(null);
    setUser(null);
    LocalStorage.remove("authToken");
  }

  const isAuthed = !!user && !!token;
  const value: AuthContextData = { user, token, login, logout, isAuthed, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
