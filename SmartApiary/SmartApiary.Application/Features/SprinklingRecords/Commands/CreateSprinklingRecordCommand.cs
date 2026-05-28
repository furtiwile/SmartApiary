using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.SprinklingRecords.Commands
{
    public record CreateSprinklingRecordCommand : IRequest<Result<string>>
    {
        public string AnnouncementId { get; init; } = string.Empty;
        public DateTime ActualStartTime { get; init; }
        public DateTime ActualEndTime { get; init; }
        public string PreparationType { get; init; } = string.Empty;
        public double WindSpeed { get; init; }
        public double Precipitation { get; init; }
    }

    public class CreateSprinklingRecordValidator : AbstractValidator<CreateSprinklingRecordCommand>
    {
        public CreateSprinklingRecordValidator()
        {
            RuleFor(x => x.AnnouncementId).NotEmpty();
            RuleFor(x => x.ActualEndTime).GreaterThanOrEqualTo(x => x.ActualStartTime);
            RuleFor(x => x.PreparationType).NotEmpty();
            RuleFor(x => x.WindSpeed).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Precipitation).GreaterThanOrEqualTo(0);
        }
    }

    internal class CreateSprinklingRecordHandler(ISprinklingRecordRepository recordRepository)
        : IRequestHandler<CreateSprinklingRecordCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateSprinklingRecordCommand request, CancellationToken ct)
        {
            var announcementIdResult = EntityId.Create(request.AnnouncementId);
            if (announcementIdResult.IsFailure)
                return Result<string>.Failure(announcementIdResult.Error!.Message, ErrorType.Validation);

            var recordResult = SprinklingRecord.Create(
                request.ActualStartTime,
                request.ActualEndTime,
                request.PreparationType,
                request.WindSpeed,
                request.Precipitation,
                announcementIdResult.Value
            );

            if (recordResult.IsFailure)
                return Result<string>.Failure(recordResult.Error!.Message, ErrorType.Validation);

            await recordRepository.SaveAsync(recordResult.Value, ct);

            return Result<string>.Success(recordResult.Value.Id.Value);
        }
    }
}
