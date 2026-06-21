using FluentValidation;
using MediatR;
using NetTopologySuite.Geometries;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Storage;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Apiaries.Commands
{
    public record UpdateApiaryCommand : IRequest<Result>
    {
        public string ApiaryId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string Description { get; init; } = string.Empty;
        public UploadedApiaryImageFile? ImageFile { get; init; }
    }

    public class UpdateApiaryValidator : AbstractValidator<UpdateApiaryCommand>
    {
        public UpdateApiaryValidator()
        {
            RuleFor(x => x.ApiaryId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            When(x => x.ImageFile != null && x.ImageFile.Content != null && x.ImageFile.Content.Length > 0, () =>
            {
                RuleFor(x => x.ImageFile!.FileName)
                    .NotEmpty().WithMessage("Apiary image filename is required.")
                    .Must(name =>
                    {
                        var extension = Path.GetExtension(name).ToLowerInvariant();
                        return extension is ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif";
                    }).WithMessage("Only JPG, JPEG, PNG, WEBP and GIF images are allowed.");
            });
        }
    }

    internal class UpdateApiaryHandler(
        IApiaryRepository apiaryRepository,
        IApiaryImageStorage apiaryImageStorage,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<UpdateApiaryCommand, Result>
    {
        public async Task<Result> Handle(UpdateApiaryCommand request, CancellationToken ct)
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

            string imageUrl = apiary.ImageUrl;
            string thumbnailUrl = apiary.ThumbnailUrl;

            if (request.ImageFile != null && request.ImageFile.Content != null && request.ImageFile.Content.Length > 0)
            {
                await apiaryImageStorage.DeleteAsync(apiaryIdResult.Value, ct);

                var imageResult = await apiaryImageStorage.SaveAsync(apiaryIdResult.Value, request.ImageFile, ct);
                if (imageResult.IsFailure)
                    return Result.Failure(imageResult.Error!.Message, imageResult.Error!.Type);

                imageUrl = imageResult.Value.ImageUrl;
                thumbnailUrl = imageResult.Value.ThumbnailUrl;
            }

            var location = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

            apiary.Update(request.Name, location, request.Description, imageUrl, thumbnailUrl);

            await apiaryRepository.UpdateAsync(apiary, ct);

            return Result.Success();
        }
    }
}
