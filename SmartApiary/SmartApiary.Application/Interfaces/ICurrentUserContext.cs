using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Interfaces
{
    public interface ICurrentUserContext
    {
        bool IsAuthenticated { get; }
        string? UserId { get; }
        RoleType? Role { get; }
    }
}