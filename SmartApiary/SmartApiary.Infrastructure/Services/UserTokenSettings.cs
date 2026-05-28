using Microsoft.Extensions.Options;
using SmartApiary.Application.Common.Options;
using SmartApiary.Application.Interfaces;

namespace SmartApiary.Infrastructure.Services
{
    internal class UserTokenSettings(IOptions<UserTokenOptions> options) : IUserTokenSettings
    {
        private readonly UserTokenOptions _options = options.Value;

        public int ActivationTokenMinutes => _options.ActivationTokenMinutes;
        public int ResetTokenMinutes => _options.ResetTokenMinutes;
    }
}
