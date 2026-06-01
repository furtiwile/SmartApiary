namespace SmartApiary.ITSimulator.Models
{
    public class TelemetrySendResult
    {
        public bool IsSuccess { get; set; }
        public int StatusCode { get; set; }
        public string ResponseBody { get; set; } = string.Empty;
    }
}