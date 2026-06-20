using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.HiveInspections.Commands
{
    public record UpdateHiveInspectionCommand : IRequest<Result>
    {
        public string HiveId { get; init; } = string.Empty;
        public string InspectionId { get; init; } = string.Empty;
        public DateTime InspectionDate { get; init; }
        public string BottomBoardColor { get; init; } = string.Empty;
        public int HoneyFrames { get; init; }
        public double HoneyAmount { get; init; }
        public int BroodFrames { get; init; }
        public bool QueenPresent { get; init; }
        public string Note { get; init; } = string.Empty;
    }

    public class UpdateHiveInspectionValidator : AbstractValidator<UpdateHiveInspectionCommand>
    {
        public UpdateHiveInspectionValidator()
        {
            RuleFor(x => x.HiveId).NotEmpty();
            RuleFor(x => x.InspectionId).NotEmpty();
            RuleFor(x => x.BottomBoardColor).NotEmpty();
            RuleFor(x => x.HoneyFrames).GreaterThanOrEqualTo(0);
            RuleFor(x => x.HoneyAmount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.BroodFrames).GreaterThanOrEqualTo(0);
        }
    }

    internal class UpdateHiveInspectionHandler(
        IHiveInspectionRepository inspectionRepository,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<UpdateHiveInspectionCommand, Result>
    {
        public async Task<Result> Handle(UpdateHiveInspectionCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var hiveIdResult = EntityId.Create(request.HiveId);
            if (hiveIdResult.IsFailure)
                return Result.Failure(hiveIdResult.Error!.Message, ErrorType.Validation);

            var inspectionIdResult = EntityId.Create(request.InspectionId);
            if (inspectionIdResult.IsFailure)
                return Result.Failure(inspectionIdResult.Error!.Message, ErrorType.Validation);

            // Verify ownership chain: Hive -> Apiary -> Beekeeper
            var hive = await hiveRepository.GetByIdAsync(hiveIdResult.Value, ct);
            if (hive == null)
                return Result.Failure("Hive not found", ErrorType.NotFound);

            var apiary = await apiaryRepository.GetByIdAsync(beekeeperIdResult.Value, hive.ApiaryId, ct);
            if (apiary == null)
                return Result.Failure("Unauthorized - you do not own this hive's apiary.", ErrorType.Unauthorized);

            var inspection = await inspectionRepository.GetByIdAsync(hiveIdResult.Value, inspectionIdResult.Value, ct);
            if (inspection == null)
                return Result.Failure("Inspection not found", ErrorType.NotFound);

            inspection.Update(
                request.InspectionDate,
                request.BottomBoardColor,
                request.HoneyFrames,
                request.HoneyAmount,
                request.BroodFrames,
                request.QueenPresent,
                request.Note
            );

            await inspectionRepository.UpdateAsync(inspection, ct);

            return Result.Success();
        }
    }
}
