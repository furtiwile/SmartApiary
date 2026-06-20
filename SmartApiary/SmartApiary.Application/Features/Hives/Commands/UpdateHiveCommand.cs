using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Hives.Commands
{
    public record UpdateHiveCommand : IRequest<Result>
    {
        public string HiveId { get; init; } = string.Empty;
        public string Designation { get; init; } = string.Empty;
        public HiveType Type { get; init; }
        public string SuperColor { get; init; } = string.Empty;
        public int QueenAge { get; init; }
        public string Note { get; init; } = string.Empty;
        public string SmartScaleId { get; init; } = string.Empty;
    }

    public class UpdateHiveValidator : AbstractValidator<UpdateHiveCommand>
    {
        public UpdateHiveValidator()
        {
            RuleFor(x => x.HiveId).NotEmpty();
            RuleFor(x => x.Designation).NotEmpty();
            RuleFor(x => x.SuperColor).NotEmpty();
            RuleFor(x => x.QueenAge).GreaterThan(0);
        }
    }

    internal class UpdateHiveHandler(
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<UpdateHiveCommand, Result>
    {
        public async Task<Result> Handle(UpdateHiveCommand request, CancellationToken ct)
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

            // SmartScaleId is optional — allow empty to represent "unpaired"
            EntityId? smartScaleId = null;
            if (!string.IsNullOrWhiteSpace(request.SmartScaleId))
            {
                var smartScaleIdResult = EntityId.Create(request.SmartScaleId);
                if (smartScaleIdResult.IsFailure)
                    return Result.Failure(smartScaleIdResult.Error!.Message, ErrorType.Validation);
                smartScaleId = smartScaleIdResult.Value;
            }

            hive.Update(
                request.Designation,
                request.Type,
                request.SuperColor,
                request.QueenAge,
                request.Note,
                smartScaleId
            );

            await hiveRepository.UpdateAsync(hive, ct);

            return Result.Success();
        }
    }
}
