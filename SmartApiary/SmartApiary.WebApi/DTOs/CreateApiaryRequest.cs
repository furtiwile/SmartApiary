using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Common;
using SmartApiary.Application.Features.Apiaries;
using SmartApiary.Application.Features.Apiaries.Commands;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.DTOs
{
    public class CreateApiaryRequest
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

        public async Task<Result<CreateApiaryCommand>> ToCommandAsync(CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(Name))
                return Result<CreateApiaryCommand>.Failure("Name is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Description))
                return Result<CreateApiaryCommand>.Failure("Description is required.", ErrorType.Validation);

            if (ImageFile == null || ImageFile.Length == 0)
                return Result<CreateApiaryCommand>.Failure("Apiary image is required.", ErrorType.Validation);

            var extension = Path.GetExtension(ImageFile.FileName).ToLowerInvariant();
            if (extension is not (".jpg" or ".jpeg" or ".png" or ".webp" or ".gif"))
                return Result<CreateApiaryCommand>.Failure("Only JPG, JPEG, PNG, WEBP and GIF images are allowed.", ErrorType.Validation);

            if (!string.IsNullOrWhiteSpace(ImageFile.ContentType) && !ImageFile.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                return Result<CreateApiaryCommand>.Failure("Apiary image must be an image file.", ErrorType.Validation);

            var fileBytes = await ImageFile.ToByteArrayAsync(ct);

            return Result<CreateApiaryCommand>.Success(new CreateApiaryCommand
            {
                Name = Name.Trim(),
                Latitude = Latitude,
                Longitude = Longitude,
                Description = Description.Trim(),
                ImageFile = new UploadedApiaryImageFile
                {
                    FileName = ImageFile.FileName,
                    ContentType = ImageFile.ContentType,
                    Content = fileBytes
                }
            });
        }
    }
}