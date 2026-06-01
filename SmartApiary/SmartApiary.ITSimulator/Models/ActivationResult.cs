namespace SmartApiary.ITSimulator.Models
{
    public class ActivationResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? DeviceToken { get; set; }
    }
}