using SmartApiary.ITSimulator.Models;
using System.Net.Http.Json;
using System.Text.Json;

namespace SmartApiary.ITSimulator.Services
{
    public class SmartScaleClient
    {
        private readonly HttpClient _apiClient;
        private readonly HttpClient _functionsClient;

        public SmartScaleClient(HttpClient apiClient, HttpClient functionsClient)
        {
            _apiClient = apiClient ?? throw new ArgumentNullException(nameof(apiClient));
            _functionsClient = functionsClient ?? throw new ArgumentNullException(nameof(functionsClient));
        }

        public async Task<string?> RegisterAsync(string apiaryId, string hiveId, string serialNumber)
        {
            var payload = new
            {
                ApiaryId = apiaryId,
                HiveId = hiveId,
                SerialNumber = serialNumber
            };

            var response = await _apiClient.PostAsJsonAsync("/api/smartscales/register", payload);
            if (!response.IsSuccessStatusCode) return null;

            var body = await response.Content.ReadFromJsonAsync<ApiResponse<string>>();
            return body?.Data;
        }

        public async Task<ActivationResult> ActivateAsync(string serialNumber, string hardwareId)
        {
            var payload = new { SerialNumber = serialNumber, HardwareId = hardwareId };
            var response = await _functionsClient.PostAsJsonAsync("/api/smartscales/activate", payload);

            var responseText = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return new ActivationResult
                {
                    IsSuccess = false,
                    Message = ExtractFailureMessage(responseText, response.ReasonPhrase)
                };
            }

            var body = JsonSerializer.Deserialize<ApiResponse<string>>(responseText, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return new ActivationResult
            {
                IsSuccess = true,
                Message = body?.Message ?? "Activation succeeded.",
                DeviceToken = body?.Data
            };
        }

        private static string ExtractFailureMessage(string responseText, string? fallback)
        {
            if (string.IsNullOrWhiteSpace(responseText))
                return fallback ?? "Activation failed.";

            try
            {
                using var document = JsonDocument.Parse(responseText);
                var root = document.RootElement;

                if (root.TryGetProperty("details", out var details))
                {
                    return details.ValueKind switch
                    {
                        JsonValueKind.String => details.GetString() ?? fallback ?? "Activation failed.",
                        JsonValueKind.Object => details.ToString(),
                        JsonValueKind.Array => details.ToString(),
                        _ => fallback ?? "Activation failed."
                    };
                }

                if (root.TryGetProperty("error", out var error))
                {
                    var errorText = error.GetString();
                    if (root.TryGetProperty("message", out var message))
                        return $"{errorText}: {message.GetString()}";
                    return errorText ?? fallback ?? "Activation failed.";
                }
            }
            catch
            {
                // Fall back to raw text below.
            }

            return responseText.Trim();
        }

        public async Task<TelemetrySendResult> SendTelemetryAsync(string deviceToken, object telemetryPayload)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/telemetry")
            {
                Content = JsonContent.Create(telemetryPayload)
            };
            request.Headers.Add("X-Device-Token", deviceToken);

            var response = await _functionsClient.SendAsync(request);
            return new TelemetrySendResult
            {
                IsSuccess = response.IsSuccessStatusCode,
                StatusCode = (int)response.StatusCode,
                ResponseBody = await response.Content.ReadAsStringAsync()
            };
        }

        public async Task<IEnumerable<SmartScaleDto>?> GetSmartScalesAsync()
        {
            var response = await _apiClient.GetAsync("/api/smartscales");
            if (!response.IsSuccessStatusCode) return null;

            var body = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<SmartScaleDto>>>();
            return body?.Data;
        }
    }
}
