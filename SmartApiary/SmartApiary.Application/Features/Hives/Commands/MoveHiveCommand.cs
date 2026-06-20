using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Hives.Commands
{
    /// <summary>
    /// Moves a hive from one apiary to another, verifying ownership of both apiaries.
    /// Since ApiaryId is the PartitionKey in Azure Table Storage, this requires a delete + re-insert
    /// with the same HiveId (RowKey) so HiveInspections remain linked.
    /// </summary>
    public record MoveHiveCommand : IRequest<Result>
    {
        public string HiveId { get; init; } = string.Empty;
        public string TargetApiaryId { get; init; } = string.Empty;
    }

    public class MoveHiveValidator : AbstractValidator<MoveHiveCommand>
    {
        public MoveHiveValidator()
        {
            RuleFor(x => x.HiveId).NotEmpty();
            RuleFor(x => x.TargetApiaryId).NotEmpty();
        }
    }

    internal class MoveHiveHandler(
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<MoveHiveCommand, Result>
    {
        public async Task<Result> Handle(MoveHiveCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var hiveIdResult = EntityId.Create(request.HiveId);
            if (hiveIdResult.IsFailure)
                return Result.Failure(hiveIdResult.Error!.Message, ErrorType.Validation);

            var targetApiaryIdResult = EntityId.Create(request.TargetApiaryId);
            if (targetApiaryIdResult.IsFailure)
                return Result.Failure(targetApiaryIdResult.Error!.Message, ErrorType.Validation);

            // Fetch hive from current location (any partition scan)
            var hive = await hiveRepository.GetByIdAsync(hiveIdResult.Value, ct);
            if (hive == null)
                return Result.Failure("Hive not found", ErrorType.NotFound);

            // Verify ownership of the SOURCE apiary
            var sourceApiary = await apiaryRepository.GetByIdAsync(beekeeperIdResult.Value, hive.ApiaryId, ct);
            if (sourceApiary == null)
                return Result.Failure("Unauthorized - you do not own the source apiary.", ErrorType.Unauthorized);

            // Verify ownership of the TARGET apiary
            var targetApiary = await apiaryRepository.GetByIdAsync(beekeeperIdResult.Value, targetApiaryIdResult.Value, ct);
            if (targetApiary == null)
                return Result.Failure("Target apiary not found or you do not own it.", ErrorType.NotFound);

            if (hive.ApiaryId.Value == request.TargetApiaryId)
                return Result.Failure("Hive is already in the target apiary.", ErrorType.Validation);

            // Delete from old partition, then re-insert into new partition with same HiveId
            await hiveRepository.DeleteAsync(hive, ct);
            hive.ApiaryId = targetApiaryIdResult.Value;
            await hiveRepository.SaveAsync(hive, ct);

            return Result.Success();
        }
    }
}
