using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Storage;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Apiaries.Commands
{
    public record DeleteApiaryCommand(string ApiaryId) : IRequest<Result>;

    public class DeleteApiaryValidator : AbstractValidator<DeleteApiaryCommand>
    {
        public DeleteApiaryValidator()
        {
            RuleFor(x => x.ApiaryId).NotEmpty();
        }
    }

    internal class DeleteApiaryHandler(
        IApiaryRepository apiaryRepository,
        IHiveRepository hiveRepository,
        IHiveInspectionRepository inspectionRepository,
        ISmartScaleRepository smartScaleRepository,
        ITelemetryRepository telemetryRepository,
        IApiaryImageStorage apiaryImageStorage,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<DeleteApiaryCommand, Result>
    {
        public async Task<Result> Handle(DeleteApiaryCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var apiaryIdResult = EntityId.Create(request.ApiaryId);
            if (apiaryIdResult.IsFailure)
                return Result.Failure(apiaryIdResult.Error!.Message, ErrorType.Validation);

            var apiary = await apiaryRepository.GetByIdAsync(beekeeperIdResult.Value, apiaryIdResult.Value, ct);
            if (apiary == null)
                return Result.Failure("Apiary not found.", ErrorType.NotFound);

            // Cascade delete hives
            var hives = await hiveRepository.GetByApiaryIdAsync(apiary.Id, ct);
            foreach (var hive in hives)
            {
                // Delete inspections
                var inspections = await inspectionRepository.GetByHiveIdAsync(hive.Id, ct: ct);
                foreach (var inspection in inspections)
                {
                    await inspectionRepository.DeleteAsync(inspection, ct);
                }

                // Delete telemetry + smart scale if paired
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
            }

            await apiaryImageStorage.DeleteAsync(apiary.Id, ct);

            await apiaryRepository.DeleteAsync(apiary, ct);

            return Result.Success();
        }
    }
}
