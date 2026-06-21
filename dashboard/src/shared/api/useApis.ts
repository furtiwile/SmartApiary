import { useContext } from "react";
import { ApiContext } from "./ApiContext";

export function useApis() {
  const clients = useContext(ApiContext);
  if (!clients) {
    throw new Error("useApis must be used inside ApiProvider");
  }
  return clients;
}
