using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Parcels.Commands
{
    public record UpdateParcelCommand : IRequest<Result>
    {
        public string ParcelId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
    }

    public class UpdateParcelValidator : AbstractValidator<UpdateParcelCommand>
    {
        public UpdateParcelValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty();
        }
    }

    internal class UpdateParcelHandler(
        IParcelRepository parcelRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<UpdateParcelCommand, Result>
    {
        public async Task<Result> Handle(UpdateParcelCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var parcel = await parcelRepository.GetByIdAsync(parcelIdResult.Value, ct);
            if (parcel == null)
                return Result.Failure("Parcel not found", ErrorType.NotFound);

            // Verify ownership
            if (parcel.FarmerId.Value != currentUser.UserId)
                return Result.Failure("Unauthorized - you do not own this parcel.", ErrorType.Unauthorized);

            var location = new NetTopologySuite.Geometries.Point(request.Longitude, request.Latitude) { SRID = 4326 };
            parcel.Update(request.Name, location);

            await parcelRepository.UpdateAsync(parcel, ct);

            return Result.Success();
        }
    }
}
