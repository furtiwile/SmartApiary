using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;

namespace SmartApiary.Application.Features.Auth.Queries
{
    public record UserDto(
        string Id,
        string Email,
        string FirstName,
        string LastName,
        string PhoneNumber,
        string Role,
        bool IsActive
    );

    public record GetUsersQuery : IRequest<Result<IReadOnlyCollection<UserDto>>>;

    internal class GetUsersHandler(IUserRepository userRepository)
        : IRequestHandler<GetUsersQuery, Result<IReadOnlyCollection<UserDto>>>
    {
        public async Task<Result<IReadOnlyCollection<UserDto>>> Handle(GetUsersQuery request, CancellationToken ct)
        {
            var users = await userRepository.GetAllUsersAsync(ct);
            var dtos = users.Select(user => new UserDto(
                user.Id.Value,
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                user.Role.ToString(),
                user.IsActive
            )).ToList();

            return Result<IReadOnlyCollection<UserDto>>.Success(dtos);
        }
    }
}
