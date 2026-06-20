using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Parcels.Commands
{
    public record DeleteParcelCommand(string ParcelId) : IRequest<Result>;

    public class DeleteParcelValidator : AbstractValidator<DeleteParcelCommand>
    {
        public DeleteParcelValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
        }
    }

    internal class DeleteParcelHandler(
        IParcelRepository parcelRepository,
        ICropRepository cropRepository,
        ISprinklingAnnouncementRepository announcementRepository,
        ISprinklingRecordRepository recordRepository,
        SmartApiary.Application.Interfaces.ICurrentUserContext currentUser
    )
        : IRequestHandler<DeleteParcelCommand, Result>
    {
        public async Task<Result> Handle(DeleteParcelCommand request, CancellationToken ct)
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

            // Cascade delete crops
            var crops = await cropRepository.GetByParcelIdAsync(parcel.Id, ct);
            foreach (var crop in crops)
            {
                await cropRepository.DeleteAsync(crop, ct);
            }

            // Cascade delete announcements and their records
            var announcements = await announcementRepository.GetByParcelIdAsync(parcel.Id, ct);
            foreach (var announcement in announcements)
            {
                var records = await recordRepository.GetByAnnouncementIdAsync(announcement.Id, ct);
                foreach (var record in records)
                {
                    await recordRepository.DeleteAsync(record, ct);
                }
                
                await announcementRepository.DeleteAsync(announcement, ct);
            }

            await parcelRepository.DeleteAsync(parcel, ct);

            return Result.Success();
        }
    }
}
