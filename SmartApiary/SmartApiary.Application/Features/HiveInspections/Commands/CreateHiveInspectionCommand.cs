using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.HiveInspections.Commands
{
    public record CreateHiveInspectionCommand : IRequest<Result<string>>
    {
        public string HiveId { get; init; } = string.Empty;
        public DateTime InspectionDate { get; init; }
        public string BottomBoardColor { get; init; } = string.Empty;
        public int HoneyFrames { get; init; }
        public double HoneyAmount { get; init; }
        public int BroodFrames { get; init; }
        public bool QueenPresent { get; init; }
        public string Note { get; init; } = string.Empty;
    }

    public class CreateHiveInspectionValidator : AbstractValidator<CreateHiveInspectionCommand>
    {
        public CreateHiveInspectionValidator()
        {
            RuleFor(x => x.HiveId).NotEmpty();
            RuleFor(x => x.BottomBoardColor).NotEmpty();
            RuleFor(x => x.HoneyFrames).GreaterThanOrEqualTo(0);
            RuleFor(x => x.HoneyAmount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.BroodFrames).GreaterThanOrEqualTo(0);
        }
    }

    internal class CreateHiveInspectionHandler(IHiveInspectionRepository inspectionRepository)
        : IRequestHandler<CreateHiveInspectionCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateHiveInspectionCommand request, CancellationToken ct)
        {
            var hiveIdResult = EntityId.Create(request.HiveId);
            if (hiveIdResult.IsFailure)
                return Result<string>.Failure(hiveIdResult.Error!.Message, ErrorType.Validation);

            var inspectionResult = HiveInspection.Create(
                request.InspectionDate,
                request.BottomBoardColor,
                request.HoneyFrames,
                request.HoneyAmount,
                request.BroodFrames,
                request.QueenPresent,
                request.Note,
                hiveIdResult.Value
            );

            if (inspectionResult.IsFailure)
                return Result<string>.Failure(inspectionResult.Error!.Message, ErrorType.Validation);

            await inspectionRepository.SaveAsync(inspectionResult.Value, ct);

            return Result<string>.Success(inspectionResult.Value.Id.Value);
        }
    }
}
