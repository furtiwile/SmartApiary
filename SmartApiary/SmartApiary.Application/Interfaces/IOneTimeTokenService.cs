using SmartApiary.Application.Common.Models;

namespace SmartApiary.Application.Interfaces
{
    public interface IOneTimeTokenService
    {
        OneTimeToken GenerateToken();
        string HashToken(string rawToken);
    }
}
