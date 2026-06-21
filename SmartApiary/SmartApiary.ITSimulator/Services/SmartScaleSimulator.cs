using SmartApiary.ITSimulator.Models;
using SmartApiary.ITSimulator.UI;
using System.Text.Json;

namespace SmartApiary.ITSimulator.Services
{
    public class SmartScaleSimulator
    {
        private readonly SmartScaleClient _client;
        private readonly string _storePath;

        public SmartScaleSimulator(SmartScaleClient client)
        {
            _client = client;
            _storePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".smartapiary_sim.json");
        }

        public async Task<IEnumerable<SmartScaleDevice>> ProcessSmartScaleIdsAsync(IEnumerable<string> smartScaleIds, int delayMs, double nominalWeight = 10)
        {
            var devicesStarted = new List<SmartScaleDevice>();

            foreach (var id in smartScaleIds)
            {
                var serial = id.Trim();
                if (string.IsNullOrWhiteSpace(serial)) continue;

                // Always attempt activation handshake. If already paired, activation handler will return existing token.
                var hardwareId = Guid.NewGuid().ToString();
                var activation = await _client.ActivateAsync(serial, hardwareId);
                if (!activation.IsSuccess || string.IsNullOrWhiteSpace(activation.DeviceToken))
                {
                    ConsoleUI.PrintError($"Activation failed for SmartScale (serial={serial}). {activation.Message}");
                    continue;
                }

                var device = new SmartScaleDevice
                {
                    SerialNumber = serial,
                    HardwareId = hardwareId,
                    DeviceToken = activation.DeviceToken,
                    HiveId = string.Empty,
                    PairedAt = DateTime.UtcNow
                };

                SaveDevice(device);

                if (string.IsNullOrWhiteSpace(device.HiveId))
                {
                    device.HiveId = PromptForHiveId(serial);
                    SaveDevice(device);
                }

                var tokenPreview = device.DeviceToken.Length > 8
                    ? $"{device.DeviceToken[..4]}...{device.DeviceToken[^4..]}"
                    : device.DeviceToken;

                // Start telemetry loop automatically after handshake
                _ = Task.Run(() => StartTelemetryLoopAsync(device, delayMs, nominalWeight));
                devicesStarted.Add(device);
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"Activated SmartScale serial={serial}. {activation.Message}");
                Console.WriteLine($"Stored device token: {tokenPreview} ({device.DeviceToken.Length} chars)");
                Console.ResetColor();
            }

            return devicesStarted;
        }

        public void SaveDevice(SmartScaleDevice device)
        {
            var list = LoadDevices().ToList();
            var existing = list.FirstOrDefault(d => d.SerialNumber == device.SerialNumber);
            if (existing != null)
            {
                list.Remove(existing);
            }
            list.Add(device);
            var json = JsonSerializer.Serialize(list, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_storePath, json);
        }

        public SmartScaleDevice? GetDevice(string serialNumber)
        {
            return LoadDevices().FirstOrDefault(device => device.SerialNumber.Equals(serialNumber, StringComparison.OrdinalIgnoreCase));
        }

        public string PromptForHiveId(string serialNumber)
        {
            while (true)
            {
                Console.Write($"Enter HiveId for SmartScale {serialNumber}: ");
                var hiveId = Console.ReadLine()?.Trim() ?? string.Empty;
                if (!string.IsNullOrWhiteSpace(hiveId))
                    return hiveId;

                ConsoleUI.PrintError("HiveId is required.");
            }
        }

        public IEnumerable<SmartScaleDevice> LoadDevices()
        {
            if (!File.Exists(_storePath)) return Enumerable.Empty<SmartScaleDevice>();
            try
            {
                var json = File.ReadAllText(_storePath);
                return JsonSerializer.Deserialize<List<SmartScaleDevice>>(json) ?? Enumerable.Empty<SmartScaleDevice>();
            }
            catch
            {
                return Enumerable.Empty<SmartScaleDevice>();
            }
        }

        public async Task StartTelemetryLoopAsync(SmartScaleDevice device, int delayMs, double nominalWeight = 10)
        {
            if (string.IsNullOrWhiteSpace(device.DeviceToken))
            {
                ConsoleUI.PrintError($"Cannot start telemetry for {device.SerialNumber}: device token is missing.");
                return;
            }

            if (string.IsNullOrWhiteSpace(device.HiveId))
            {
                ConsoleUI.PrintError($"Cannot start telemetry for {device.SerialNumber}: HiveId is missing.");
                return;
            }

            var rnd = new Random();
            int counter = 0;
            while (true)
            {
                var telemetry = new
                {
                    HiveId = device.HiveId,
                    Timestamp = DateTime.UtcNow,
                    WeightKg = counter > 3 ? 2.0 : Math.Round(nominalWeight + (rnd.NextDouble() - 0.5) * 2.0, 2),
                    TemperatureC = Math.Round(20 + (rnd.NextDouble() - 0.5) * 10, 2),
                    HumidityPercent = Math.Round(50 + (rnd.NextDouble() - 0.5) * 20, 2),
                    BatteryPercent = Math.Round(90 + rnd.NextDouble() * 10, 2)
                };
                if (counter > 3)
                {
                    counter = 0;
                }
                var sendResult = await _client.SendTelemetryAsync(device.DeviceToken, telemetry);
                if (!sendResult.IsSuccess)
                    ConsoleUI.PrintError($"Failed to send telemetry for {device.SerialNumber} (status {(System.Net.HttpStatusCode)sendResult.StatusCode}): {sendResult.ResponseBody}");
                else
                    Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Sent telemetry for hive {device.HiveId}, weight={telemetry.WeightKg}kg temp={telemetry.TemperatureC}C hum={telemetry.HumidityPercent}% batt={telemetry.BatteryPercent}%");
                counter++;
                await Task.Delay(delayMs);
            }
        }

        public async Task<IEnumerable<SmartScaleDevice>> AutoDiscoverFromDatabaseAsync()
        {
            var discovered = new List<SmartScaleDevice>();
            try
            {
                var connectionString = "UseDevelopmentStorage=true";
                var scalesTable = new Azure.Data.Tables.TableClient(connectionString, "SmartScales");
                var hivesTable = new Azure.Data.Tables.TableClient(connectionString, "Hives");

                var allHives = hivesTable.QueryAsync<Azure.Data.Tables.TableEntity>();

                await foreach (var hiveEntity in allHives)
                {
                    var smartScaleId = hiveEntity.GetString("SmartScaleId");
                    var hiveId = hiveEntity.RowKey;

                    if (string.IsNullOrWhiteSpace(smartScaleId))
                        continue;

                    // Find the scale (it could be in Unpaired or Paired partition)
                    var scales = scalesTable.QueryAsync<Azure.Data.Tables.TableEntity>(filter: $"RowKey eq '{smartScaleId}'");
                    string? serialNumber = null;
                    string? deviceToken = null;
                    string? hardwareId = null;

                    await foreach (var scaleEntity in scales)
                    {
                        serialNumber = scaleEntity.GetString("SerialNumber");
                        deviceToken = scaleEntity.GetString("DeviceToken");
                        hardwareId = scaleEntity.GetString("HardwareId");
                        break;
                    }

                    if (!string.IsNullOrWhiteSpace(serialNumber))
                    {
                        // Even if it's Unpaired, we have the serial number. We need to activate it to get a token!
                        if (string.IsNullOrWhiteSpace(deviceToken))
                        {
                            hardwareId = Guid.NewGuid().ToString();
                            var activation = await _client.ActivateAsync(serialNumber, hardwareId);
                            if (activation.IsSuccess && !string.IsNullOrWhiteSpace(activation.DeviceToken))
                            {
                                deviceToken = activation.DeviceToken;
                                Console.WriteLine($"Activated auto-discovered scale: {serialNumber}");
                            }
                            else
                            {
                                ConsoleUI.PrintError($"Failed to activate {serialNumber}.");
                                continue;
                            }
                        }

                        var device = new SmartScaleDevice
                        {
                            SerialNumber = serialNumber,
                            HardwareId = hardwareId ?? string.Empty,
                            DeviceToken = deviceToken,
                            HiveId = hiveId,
                            PairedAt = DateTime.UtcNow
                        };
                        SaveDevice(device); 
                        discovered.Add(device);
                    }
                }
            }
            catch (Exception ex)
            {
                ConsoleUI.PrintError($"Error auto-discovering: {ex.Message}");
            }

            return discovered;
        }
    }
}
