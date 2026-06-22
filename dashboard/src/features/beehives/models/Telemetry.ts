/**
 * Telemetry reading from a SmartScale device.
 * Matches the SignalR event payload and the backend telemetry schema.
 */
export type TelemetryReading = {
  hiveId: string;
  hiveName?: string;
  apiaryId: string;
  timestamp: string;        // ISO datetime
  weightKg: number;
  temperatureC: number;
  humidityPercent: number;
  batteryPercent: number;
  isAlert: boolean;
  alertType?: "Theft" | "BatteryLow" | "PesticideWarning" | "WeightDrop";
};

/** Nectar Gain/Loss reading derived from morning/evening weight delta */
export type NectarDelta = {
  date: string;             // YYYY-MM-DD
  hiveName: string;
  deltaKg: number;          // positive = gain, negative = loss
};
