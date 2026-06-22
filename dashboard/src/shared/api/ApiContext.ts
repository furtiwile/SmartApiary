import { createContext } from "react";
import type { ApiClients } from "./ApiClients";

export const ApiContext = createContext<ApiClients | null>(null);
