using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Storage;
using SmartApiary.Application.Features.Apiaries;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using NetTopologySuite.Geometries;

namespace SmartApiary.Application.Features.Apiaries.Commands
{
    public record CreateApiaryCommand : IRequest<Result<string>>
    {
        public string Name { get; init; } = string.Empty;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string Description { get; init; } = string.Empty;
        public UploadedApiaryImageFile ImageFile { get; init; } = new();
    }

    public class CreateApiaryValidator : AbstractValidator<CreateApiaryCommand>
    {
        public CreateApiaryValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.ImageFile).NotNull();
            RuleFor(x => x.ImageFile.Content)
                .NotEmpty().WithMessage("Apiary image is required.")
                .Must(content => content.Length > 0).WithMessage("Apiary image cannot be empty.");
            RuleFor(x => x.ImageFile.FileName)
                .NotEmpty().WithMessage("Apiary image filename is required.")
                .Must(name =>
                {
                    var extension = Path.GetExtension(name).ToLowerInvariant();
                    return extension is ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif";
                }).WithMessage("Only JPG, JPEG, PNG, WEBP and GIF images are allowed.");
        }
    }

    internal class CreateApiaryHandler(
        IApiaryRepository apiaryRepository,
        IApiaryImageStorage apiaryImageStorage,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<CreateApiaryCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateApiaryCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<string>.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result<string>.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var apiaryId = EntityId.New();

            var imageResult = await apiaryImageStorage.SaveAsync(apiaryId, request.ImageFile, ct);
            if (imageResult.IsFailure)
                return Result<string>.Failure(imageResult.Error!.Message, imageResult.Error!.Type);

            var location = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

            var apiaryResult = Apiary.Create(
                apiaryId,
                request.Name,
                location,
                request.Description,
                imageResult.Value.ImageUrl,
                imageResult.Value.ThumbnailUrl,
                beekeeperIdResult.Value
            );

            if (apiaryResult.IsFailure)
                return Result<string>.Failure(apiaryResult.Error!.Message, ErrorType.Validation);

            await apiaryRepository.SaveAsync(apiaryResult.Value, ct);

            return Result<string>.Success(apiaryResult.Value.Id.Value);
        }
    }
}
