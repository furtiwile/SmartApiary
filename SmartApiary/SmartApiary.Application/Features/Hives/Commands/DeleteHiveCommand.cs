using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Hives.Commands
{
    public record DeleteHiveCommand(string HiveId) : IRequest<Result>;

    public class DeleteHiveValidator : AbstractValidator<DeleteHiveCommand>
    {
        public DeleteHiveValidator()
        {
            RuleFor(x => x.HiveId).NotEmpty();
        }
    }

    internal class DeleteHiveHandler(
        IHiveRepository hiveRepository,
        IHiveInspectionRepository inspectionRepository,
        ISmartScaleRepository smartScaleRepository,
        ITelemetryRepository telemetryRepository,
        IApiaryRepository apiaryRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<DeleteHiveCommand, Result>
    {
        public async Task<Result> Handle(DeleteHiveCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var hiveIdResult = EntityId.Create(request.HiveId);
            if (hiveIdResult.IsFailure)
                return Result.Failure(hiveIdResult.Error!.Message, ErrorType.Validation);

            var hive = await hiveRepository.GetByIdAsync(hiveIdResult.Value, ct);
            if (hive == null)
                return Result.Failure("Hive not found", ErrorType.NotFound);

            // Verify ownership via parent Apiary
            var apiary = await apiaryRepository.GetByIdAsync(beekeeperIdResult.Value, hive.ApiaryId, ct);
            if (apiary == null)
                return Result.Failure("Unauthorized - you do not own this hive's apiary.", ErrorType.Unauthorized);

            // Cascade delete inspections
            var inspections = await inspectionRepository.GetByHiveIdAsync(hive.Id, ct: ct);
            foreach (var inspection in inspections)
            {
                await inspectionRepository.DeleteAsync(inspection, ct);
            }

            // Cascade delete telemetry + smart scale
            if (hive.SmartScaleId != null && !string.IsNullOrWhiteSpace(hive.SmartScaleId.Value))
            {
                await telemetryRepository.DeleteAllBySmartScaleIdAsync(hive.SmartScaleId, ct);

                var smartScale = await smartScaleRepository.GetByIdAsync(hive.SmartScaleId, ct);
                if (smartScale != null)
                {
                    await smartScaleRepository.DeleteAsync(smartScale, ct);
                }
            }

            await hiveRepository.DeleteAsync(hive, ct);

            return Result.Success();
        }
    }
}
