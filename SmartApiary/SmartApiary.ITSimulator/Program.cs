using Microsoft.Extensions.Configuration;
using SmartApiary.ITSimulator.Services;
using SmartApiary.ITSimulator.UI;


// Load configuration
var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();

// Get settings
var delayMs = int.Parse(configuration["SimulatorSettings:DelayMilliseconds"] ?? "10000");

// Initialize services
ConsoleUI.PrintHeader();

var apiBaseUrl = configuration["SimulatorSettings:ApiBaseUrl"]
    ?? throw new InvalidOperationException("Api base URL is not configured");
var functionsBaseUrl = configuration["SimulatorSettings:FunctionsBaseUrl"]
    ?? throw new InvalidOperationException("Functions base URL is not configured");

using var functionsClient = new HttpClient { BaseAddress = new Uri(functionsBaseUrl) };

// Use SmartScaleClient + SmartScaleSimulator for pairing and telemetry
var smartClient = new SmartScaleClient(functionsClient);
var smartSimulator = new SmartScaleSimulator(smartClient);
await smartSimulator.SyncLocalStoreWithDatabaseAsync();

while (true)
{
    try
    {
        Console.WriteLine("Select action:");
        Console.WriteLine("  1) Process SmartScale IDs (activate if needed and start telemetry)");
        Console.WriteLine("  2) Start telemetry loop for a single persisted SmartScale");
        Console.WriteLine("  3) Start telemetry loop for ALL persisted SmartScales");
        Console.WriteLine("  4) Auto-discover and simulate ALL paired Smart Scales from Database");
        Console.WriteLine("  5) Exit");
        Console.WriteLine("  6) Simulate Hive Theft / Wind Overturn (Sudden Weight Drop)");
        Console.WriteLine("  7) Simulate Low Battery Warning (< 15%)");
        Console.Write("Choice (1-7): ");
        var choice = Console.ReadLine()?.Trim() ?? string.Empty;

        if (choice == "1")
        {
            Console.Write("Enter comma-separated SmartScale IDs: ");
            var input = Console.ReadLine() ?? string.Empty;
            var ids = input.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            if (!ids.Any())
            {
                ConsoleUI.PrintError("No SmartScale IDs provided.");
                continue;
            }

            var started = await smartSimulator.ProcessSmartScaleIdsAsync(ids, delayMs);
            if (!started.Any())
            {
                ConsoleUI.PrintError("No devices started. Check IDs and endpoints.");
                continue;
            }

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"Started {started.Count()} device(s) telemetry.");
            Console.ResetColor();
        }
        else if (choice == "2")
        {
            var devices = smartSimulator.LoadDevices().ToList();
            if (!devices.Any())
            {
                ConsoleUI.PrintError("No persisted devices found. Pair one first.");
                continue;
            }

            Console.WriteLine("Persisted devices:");
            for (int i = 0; i < devices.Count; i++)
            {
                Console.WriteLine($"  {i + 1}. {devices[i].SerialNumber} (Hive: {devices[i].HiveId})");
            }
            Console.Write("Select device index to start telemetry: ");
            if (!int.TryParse(Console.ReadLine(), out int idx) || idx < 1 || idx > devices.Count)
            {
                ConsoleUI.PrintError("Invalid selection.");
                continue;
            }

            var device = devices[idx - 1];
            if (string.IsNullOrWhiteSpace(device.HiveId))
            {
                device.HiveId = await smartSimulator.FindHiveIdBySerialNumberAsync(device.SerialNumber);
                if (string.IsNullOrWhiteSpace(device.HiveId))
                {
                    device.HiveId = smartSimulator.PromptForHiveId(device.SerialNumber);
                }
                smartSimulator.SaveDevice(device);
            }

            _ = Task.Run(() => smartSimulator.StartTelemetryLoopAsync(device, delayMs));
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"Started telemetry loop for {device.SerialNumber}.");
            Console.ResetColor();
        }
        else if (choice == "3")
        {
            var devices = smartSimulator.LoadDevices().ToList();
            if (!devices.Any())
            {
                ConsoleUI.PrintError("No persisted devices found. Pair one first.");
                continue;
            }

            foreach (var device in devices)
            {
                if (string.IsNullOrWhiteSpace(device.HiveId))
                {
                    device.HiveId = await smartSimulator.FindHiveIdBySerialNumberAsync(device.SerialNumber);
                    if (string.IsNullOrWhiteSpace(device.HiveId))
                    {
                        device.HiveId = smartSimulator.PromptForHiveId(device.SerialNumber);
                    }
                    smartSimulator.SaveDevice(device);
                }
                _ = Task.Run(() => smartSimulator.StartTelemetryLoopAsync(device, delayMs));
            }
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"Started telemetry loop for ALL {devices.Count} devices.");
            Console.ResetColor();
        }
        else if (choice == "4")
        {
            Console.WriteLine("Auto-discovering paired smart scales from Azurite...");
            var discovered = await smartSimulator.AutoDiscoverFromDatabaseAsync();
            if (!discovered.Any())
            {
                ConsoleUI.PrintError("No paired Smart Scales found in the database.");
                continue;
            }
            
            foreach (var device in discovered)
            {
                _ = Task.Run(() => smartSimulator.StartTelemetryLoopAsync(device, delayMs));
            }
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"Started telemetry loop for ALL {discovered.Count()} discovered devices.");
            Console.ResetColor();
        }
        else if (choice == "5")
        {
            Console.WriteLine("Exiting.");
            break;
        }
        else if (choice == "6")
        {
            var devices = smartSimulator.LoadDevices().ToList();
            if (!devices.Any())
            {
                ConsoleUI.PrintError("No persisted devices found. Pair or discover one first.");
                continue;
            }

            Console.WriteLine("Select device to simulate Hive Theft / Overturn:");
            for (int i = 0; i < devices.Count; i++)
            {
                Console.WriteLine($"  {i + 1}. {devices[i].SerialNumber} (Hive: {devices[i].HiveId})");
            }
            Console.Write("Choice: ");
            if (!int.TryParse(Console.ReadLine(), out int idx) || idx < 1 || idx > devices.Count)
            {
                ConsoleUI.PrintError("Invalid selection.");
                continue;
            }

            var device = devices[idx - 1];
            if (string.IsNullOrWhiteSpace(device.HiveId))
            {
                device.HiveId = smartSimulator.PromptForHiveId(device.SerialNumber);
                smartSimulator.SaveDevice(device);
            }

            await smartSimulator.SimulateHiveTheftOrOverturnAsync(device);
        }
        else if (choice == "7")
        {
            var devices = smartSimulator.LoadDevices().ToList();
            if (!devices.Any())
            {
                ConsoleUI.PrintError("No persisted devices found. Pair or discover one first.");
                continue;
            }

            Console.WriteLine("Select device to simulate Low Battery Warning:");
            for (int i = 0; i < devices.Count; i++)
            {
                Console.WriteLine($"  {i + 1}. {devices[i].SerialNumber} (Hive: {devices[i].HiveId})");
            }
            Console.Write("Choice: ");
            if (!int.TryParse(Console.ReadLine(), out int idx) || idx < 1 || idx > devices.Count)
            {
                ConsoleUI.PrintError("Invalid selection.");
                continue;
            }

            var device = devices[idx - 1];
            if (string.IsNullOrWhiteSpace(device.HiveId))
            {
                device.HiveId = smartSimulator.PromptForHiveId(device.SerialNumber);
                smartSimulator.SaveDevice(device);
            }

            await smartSimulator.SimulateLowBatteryWarningAsync(device);
        }
        else
        {
            ConsoleUI.PrintError("Invalid choice.");
        }
    }
    catch (Exception ex)
    {
        ConsoleUI.PrintError(ex.Message);
    }

    Console.WriteLine();
}