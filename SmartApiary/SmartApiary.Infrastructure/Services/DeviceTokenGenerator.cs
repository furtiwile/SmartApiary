using SmartApiary.Application.Interfaces;
using System.Security.Cryptography;

namespace SmartApiary.Infrastructure.Services
{
    internal class DeviceTokenGenerator : IDeviceTokenGenerator
    {
        public string GenerateToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        }
    }
}
