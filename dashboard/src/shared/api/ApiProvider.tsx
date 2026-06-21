import type { ReactNode } from "react";
import { apiClients, type ApiClients } from "./ApiClients";
import { ApiContext } from "./ApiContext";

export function ApiProvider({
  children,
  clients = apiClients,
}: {
  children: ReactNode;
  clients?: ApiClients;
}) {
  return <ApiContext.Provider value={clients}>{children}</ApiContext.Provider>;
}
