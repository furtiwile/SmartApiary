using Microsoft.Extensions.Options;
using SmartApiary.Application.Common.Options;
using SmartApiary.Application.Interfaces;

namespace SmartApiary.Infrastructure.Services
{
    public class ParallelSettingsProvider(IOptions<ParallelSettings> options) : IParallelSettingsProvider
    {
        private readonly ParallelSettings _settings = options.Value;

        public int MaxDegreeOfParallelism => _settings.MaxDegreeOfParallelism;
    }
}
