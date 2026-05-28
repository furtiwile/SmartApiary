using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace SmartApiary.Infrastructure.Services
{
    internal class OneTimeTokenService : IOneTimeTokenService
    {
        public OneTimeToken GenerateToken()
        {
            var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
            var hash = HashToken(rawToken);
            return new OneTimeToken(rawToken, hash);
        }

        public string HashToken(string rawToken)
        {
            if (string.IsNullOrWhiteSpace(rawToken))
                return string.Empty;

            var bytes = Encoding.UTF8.GetBytes(rawToken);
            var hashBytes = SHA256.HashData(bytes);
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }
    }
}
