using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    public record CreateSprinklingAnnouncementCommand : IRequest<Result<string>>
    {
        public string ParcelId { get; init; } = string.Empty;
        public DateTime StartTime { get; init; }
        public double ExpectedDurationHours { get; init; }
        public string PreparationType { get; init; } = string.Empty;
    }

    public class CreateSprinklingAnnouncementValidator : AbstractValidator<CreateSprinklingAnnouncementCommand>
    {
        public CreateSprinklingAnnouncementValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
            RuleFor(x => x.ExpectedDurationHours).GreaterThan(0);
        }
    }

    internal class CreateSprinklingAnnouncementHandler(
        ISprinklingAnnouncementRepository announcementRepository,
        IParcelRepository parcelRepository,
        IAnnouncementQueueService announcementQueueService
    ) : IRequestHandler<CreateSprinklingAnnouncementCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateSprinklingAnnouncementCommand request, CancellationToken ct)
        {
            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
            {
                return Result<string>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);
            }

            var parcel = await parcelRepository.GetByIdAsync(parcelIdResult.Value, ct);
            if (parcel == null)
            {
                return Result<string>.Failure("Target parcel does not exist.", ErrorType.NotFound);
            }

            var announcementResult = SprinklingAnnouncement.Create(
                request.StartTime,
                request.ExpectedDurationHours,
                request.PreparationType,
                false,
                parcelIdResult.Value
            );

            if (announcementResult.IsFailure)
            {
                return Result<string>.Failure(announcementResult.Error!.Message, ErrorType.Validation);
            }

            await announcementRepository.SaveAsync(announcementResult.Value, ct);

            await announcementQueueService.SendAnnouncementMessageAsync(announcementResult.Value.Id.Value, AnnouncementAction.Created, ct);

            return Result<string>.Success(announcementResult.Value.Id.Value);
        }
    }
}