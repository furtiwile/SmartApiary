using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.HiveInspections.Commands
{
    public record DeleteHiveInspectionCommand(string HiveId, string InspectionId) : IRequest<Result>;

    public class DeleteHiveInspectionValidator : AbstractValidator<DeleteHiveInspectionCommand>
    {
        public DeleteHiveInspectionValidator()
        {
            RuleFor(x => x.HiveId).NotEmpty();
            RuleFor(x => x.InspectionId).NotEmpty();
        }
    }

    internal class DeleteHiveInspectionHandler(
        IHiveInspectionRepository inspectionRepository,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<DeleteHiveInspectionCommand, Result>
    {
        public async Task<Result> Handle(DeleteHiveInspectionCommand request, CancellationToken ct)
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

            await inspectionRepository.DeleteAsync(inspection, ct);

            return Result.Success();
        }
    }
}
