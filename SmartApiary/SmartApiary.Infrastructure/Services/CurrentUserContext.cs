using Microsoft.AspNetCore.Http;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SmartApiary.Infrastructure.Services
{
    internal sealed class CurrentUserContext(IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
    {
        public bool IsAuthenticated => httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;

        public string? UserId => httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        public RoleType? Role
        {
            get
            {
                var roleValue = httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
                return Enum.TryParse<RoleType>(roleValue, ignoreCase: true, out var role)
                    ? role
                    : null;
            }
        }
    }
}