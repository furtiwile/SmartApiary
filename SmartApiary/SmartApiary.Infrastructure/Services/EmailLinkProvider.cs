using Microsoft.Extensions.Options;
using SmartApiary.Application.Common.Options;
using SmartApiary.Application.Interfaces;

namespace SmartApiary.Infrastructure.Services
{
    internal class EmailLinkProvider(IOptions<EmailOptions> options) : IEmailLinkProvider
    {
        private readonly EmailOptions _options = options.Value;

        public bool ReturnLinkInResponse => _options.ReturnLinkInResponse;

        public string BuildActivationLink(string token)
        {
            return BuildLink(_options.ActivationPath, token);
        }

        public string BuildResetLink(string token)
        {
            return BuildLink(_options.ResetPasswordPath, token);
        }

        private string BuildLink(string path, string token)
        {
            var baseUrl = _options.BaseUrl?.TrimEnd('/') ?? string.Empty;
            var normalizedPath = path.StartsWith('/') ? path : $"/{path}";
            return $"{baseUrl}{normalizedPath}?token={token}";
        }
    }
}
