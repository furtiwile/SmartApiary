import { useContext } from "react";
import { ApiarySRContext } from "../contexts/ApiarySRContextDef";

export function useApiarySignalR() {
  const ctx = useContext(ApiarySRContext);
  if (!ctx) throw new Error("useApiarySignalR must be used inside ApiarySignalRProvider");
  return ctx;
}
