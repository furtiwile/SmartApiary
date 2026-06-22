import { useContext } from "react";
import type { AuthContextData } from "../models/AuthContextData";
import AuthContext from "../contexts/AuthContext";



export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
