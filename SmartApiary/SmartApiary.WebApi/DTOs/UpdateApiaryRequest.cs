using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Apiaries;
using SmartApiary.Application.Features.Apiaries.Commands;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.DTOs
{
    public class UpdateApiaryRequest
    {
        [FromForm(Name = "Name")]
        public string Name { get; set; } = string.Empty;

        [FromForm(Name = "Latitude")]
        public double Latitude { get; set; }

        [FromForm(Name = "Longitude")]
        public double Longitude { get; set; }

        [FromForm(Name = "Description")]
        public string Description { get; set; } = string.Empty;

        [FromForm(Name = "ImageFile")]
        public IFormFile? ImageFile { get; set; }

        public async Task<Result<UpdateApiaryCommand>> ToCommandAsync(string apiaryId, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(apiaryId))
                return Result<UpdateApiaryCommand>.Failure("ApiaryId is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Name))
                return Result<UpdateApiaryCommand>.Failure("Name is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Description))
                return Result<UpdateApiaryCommand>.Failure("Description is required.", ErrorType.Validation);

            UploadedApiaryImageFile? uploadedImage = null;

            if (ImageFile != null && ImageFile.Length > 0)
            {
                var extension = Path.GetExtension(ImageFile.FileName).ToLowerInvariant();
                if (extension is not (".jpg" or ".jpeg" or ".png" or ".webp" or ".gif"))
                    return Result<UpdateApiaryCommand>.Failure("Only JPG, JPEG, PNG, WEBP and GIF images are allowed.", ErrorType.Validation);

                var fileBytes = await ImageFile.ToByteArrayAsync(ct);
                uploadedImage = new UploadedApiaryImageFile
                {
                    FileName = ImageFile.FileName,
                    ContentType = ImageFile.ContentType,
                    Content = fileBytes
                };
            }

            return Result<UpdateApiaryCommand>.Success(new UpdateApiaryCommand
            {
                ApiaryId = apiaryId,
                Name = Name.Trim(),
                Latitude = Latitude,
                Longitude = Longitude,
                Description = Description.Trim(),
                ImageFile = uploadedImage
            });
        }
    }
}
