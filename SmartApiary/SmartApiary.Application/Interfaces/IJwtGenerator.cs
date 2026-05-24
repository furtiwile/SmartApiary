using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces
{
    public interface IJwtGenerator
    {
        string Generate(User user);
    }
}
