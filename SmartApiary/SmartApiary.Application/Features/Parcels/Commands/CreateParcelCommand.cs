using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Parcels.Commands
{
    public record CreateParcelCommand : IRequest<Result<string>>
    {
        public string Name { get; init; } = string.Empty;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
    }

    public class CreateParcelValidator : AbstractValidator<CreateParcelCommand>
    {
        public CreateParcelValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
        }
    }

    internal class CreateParcelHandler(IParcelRepository parcelRepository, SmartApiary.Application.Interfaces.ICurrentUserContext currentUser)
        : IRequestHandler<CreateParcelCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateParcelCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<string>.Failure("Unauthorized", ErrorType.Unauthorized);

            var farmerIdResult = EntityId.Create(currentUser.UserId!);
            if (farmerIdResult.IsFailure)
                return Result<string>.Failure(farmerIdResult.Error!.Message, ErrorType.Validation);

            var parcelResult = Parcel.Create(
                request.Name,
                request.Latitude,
                request.Longitude,
                farmerIdResult.Value
            );

            if (parcelResult.IsFailure)
                return Result<string>.Failure(parcelResult.Error!.Message, ErrorType.Validation);

            await parcelRepository.SaveAsync(parcelResult.Value, ct);

            return Result<string>.Success(parcelResult.Value.Id.Value);
        }
    }
}
