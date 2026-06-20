using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Hives.Commands
{
    public record CreateHiveCommand : IRequest<Result<string>>
    {
        public string ApiaryId { get; init; } = string.Empty;
        public string Designation { get; init; } = string.Empty;
        public HiveType Type { get; init; }
        public string SuperColor { get; init; } = string.Empty;
        public int QueenAge { get; init; }
        public string Note { get; init; } = string.Empty;
        public string? SmartScaleId { get; init; }
    }

    public class CreateHiveValidator : AbstractValidator<CreateHiveCommand>
    {
        public CreateHiveValidator()
        {
            RuleFor(x => x.ApiaryId).NotEmpty();
            RuleFor(x => x.Designation).NotEmpty();
            RuleFor(x => x.SuperColor).NotEmpty();
            RuleFor(x => x.QueenAge).GreaterThan(0);
        }
    }

    internal class CreateHiveHandler(
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<CreateHiveCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateHiveCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<string>.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result<string>.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var apiaryIdResult = EntityId.Create(request.ApiaryId);
            if (apiaryIdResult.IsFailure)
                return Result<string>.Failure(apiaryIdResult.Error!.Message, ErrorType.Validation);

            var apiary = await apiaryRepository.GetByIdAsync(beekeeperIdResult.Value, apiaryIdResult.Value, ct);
            if (apiary == null)
                return Result<string>.Failure("Apiary not found", ErrorType.NotFound);

            EntityId? smartScaleIdResult = null;
            if (!string.IsNullOrWhiteSpace(request.SmartScaleId))
            {
                var scaleIdRes = EntityId.Create(request.SmartScaleId);
                if (scaleIdRes.IsFailure)
                    return Result<string>.Failure(scaleIdRes.Error!.Message, ErrorType.Validation);
                smartScaleIdResult = scaleIdRes.Value;
            }

            var hiveResult = Hive.Create(
                request.Designation,
                request.Type,
                request.SuperColor,
                request.QueenAge,
                request.Note,
                apiaryIdResult.Value,
                smartScaleIdResult
            );

            if (hiveResult.IsFailure)
                return Result<string>.Failure(hiveResult.Error!.Message, ErrorType.Validation);

            await hiveRepository.SaveAsync(hiveResult.Value, ct);

            return Result<string>.Success(hiveResult.Value.Id.Value);
        }
    }
}
