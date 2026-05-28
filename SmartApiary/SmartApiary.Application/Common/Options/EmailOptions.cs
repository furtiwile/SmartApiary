namespace SmartApiary.Application.Common.Options
{
    public class EmailOptions
    {
        public string SendGridApiKey { get; init; } = string.Empty;
        public string FromEmail { get; init; } = string.Empty;
        public string FromName { get; init; } = string.Empty;
        public string BaseUrl { get; init; } = string.Empty;
        public string ActivationPath { get; init; } = "/activate";
        public string ResetPasswordPath { get; init; } = "/reset-password";
        public bool ReturnLinkInResponse { get; init; }
    }
}
