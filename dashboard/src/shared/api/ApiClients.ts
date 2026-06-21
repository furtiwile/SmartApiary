import { ApiaryApi } from "../../features/beehives/api/apiaryApi";
import { BeehiveApi } from "../../features/beehives/api/beehiveApi";
import { DevicePairingApi, InspectionApi, TelemetryApi } from "../../features/beehives/api/telemetryApi";
import { FarmApi } from "../../features/farms/api/farmApi";
import { CropApi, SprayingApi } from "../../features/farms/api/sprayingApi";
import { GeoApi } from "../../features/maps/api/geoApi";
import { AuthApi } from "../../features/users/api/AuthApi";

export const apiClients = {
  apiaries: ApiaryApi,
  auth: AuthApi,
  beehives: BeehiveApi,
  crops: CropApi,
  devicePairing: DevicePairingApi,
  farms: FarmApi,
  geo: GeoApi,
  inspections: InspectionApi,
  spraying: SprayingApi,
  telemetry: TelemetryApi,
} as const;

export type ApiClients = typeof apiClients;
