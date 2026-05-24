using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Common.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartApiary.Infrastructure.Services
{
    internal class JwtGenerator(
        IOptions<JwtOptions> options, 
        IDateTimeProvider dateTimeProvider
    ) : IJwtGenerator
    {
        private readonly JwtOptions _options = options.Value;
        public string Generate(User user)
        {
            var signingCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret)),
                SecurityAlgorithms.HmacSha256
            );

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.Value),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
                new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                expires: dateTimeProvider.UtcNow.AddMinutes(_options.ExpiryMinutes),
                signingCredentials: signingCredentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
