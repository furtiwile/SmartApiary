using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SmartApiary.Application.Common;
using SmartApiary.Application.Features.Apiaries;
using SmartApiary.Application.Interfaces.Storage;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;

namespace SmartApiary.Infrastructure.Persistence.AzureBlob.Storages
{
    internal sealed class ApiaryImageStorage(
        BlobServiceClient blobServiceClient,
        ILogger<ApiaryImageStorage> logger,
        IOptions<AzureBlobOptions> options
    ) : IApiaryImageStorage
    {
        private readonly BlobContainerClient _containerClient = blobServiceClient.GetBlobContainerClient(options.Value.ApiaryImagesBlob);

        public async Task<Result<ApiaryImageUploadResult>> SaveAsync(EntityId apiaryId, UploadedApiaryImageFile file, CancellationToken ct = default)
        {
            if (apiaryId is null || string.IsNullOrWhiteSpace(apiaryId.Value))
                return Result<ApiaryImageUploadResult>.Failure("Apiary ID is required.", SmartApiary.Domain.Enums.ErrorType.Validation);

            if (file.Content is null || file.Content.Length == 0)
                return Result<ApiaryImageUploadResult>.Failure("Apiary image is required.", SmartApiary.Domain.Enums.ErrorType.Validation);

            var extension = NormalizeExtension(Path.GetExtension(file.FileName));
            if (!IsAllowedExtension(extension))
                return Result<ApiaryImageUploadResult>.Failure("Only JPG, JPEG, PNG, WEBP and GIF images are allowed.", SmartApiary.Domain.Enums.ErrorType.Validation);

            await _containerClient.CreateIfNotExistsAsync(cancellationToken: ct);

            var imageBlobName = $"apiaries/{apiaryId.Value}/original{extension}";
            var thumbnailBlobName = $"apiaries/{apiaryId.Value}/thumbnail.jpg";

            var imageClient = _containerClient.GetBlobClient(imageBlobName);
            var thumbnailClient = _containerClient.GetBlobClient(thumbnailBlobName);

            try
            {
                await using var imageStream = new MemoryStream(file.Content);
                await imageClient.UploadAsync(
                    imageStream,
                    new BlobUploadOptions
                    {
                        HttpHeaders = new BlobHttpHeaders
                        {
                            ContentType = GetContentType(extension, file.ContentType)
                        }
                    },
                    ct);

                using var sourceImage = Image.Load(file.Content);
                sourceImage.Mutate(x => x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(320, 320)
                }));

                await using var thumbnailStream = new MemoryStream();
                await sourceImage.SaveAsJpegAsync(thumbnailStream, ct);
                thumbnailStream.Position = 0;

                await thumbnailClient.UploadAsync(
                    thumbnailStream,
                    new BlobUploadOptions
                    {
                        HttpHeaders = new BlobHttpHeaders
                        {
                            ContentType = "image/jpeg"
                        }
                    },
                    ct);

                return Result<ApiaryImageUploadResult>.Success(new ApiaryImageUploadResult(
                    imageClient.Uri.ToString(),
                    thumbnailClient.Uri.ToString()));
            }
            catch (Exception ex)
            {
                await imageClient.DeleteIfExistsAsync(cancellationToken: ct);
                await thumbnailClient.DeleteIfExistsAsync(cancellationToken: ct);
                logger.LogError(ex, "Failed to store apiary image for {ApiaryId}", apiaryId.Value);
                return Result<ApiaryImageUploadResult>.Failure("Failed to process apiary image.", SmartApiary.Domain.Enums.ErrorType.Failure);
            }
        }

        public async Task DeleteAsync(EntityId apiaryId, CancellationToken ct = default)
        {
            if (apiaryId is null || string.IsNullOrWhiteSpace(apiaryId.Value))
                return;

            var prefix = $"apiaries/{apiaryId.Value}/";
            
            try
            {
                var blobs = _containerClient.GetBlobsAsync(Azure.Storage.Blobs.Models.BlobTraits.None, Azure.Storage.Blobs.Models.BlobStates.None, prefix: prefix, cancellationToken: ct);
                await foreach (var blob in blobs)
                {
                    await _containerClient.DeleteBlobIfExistsAsync(blob.Name, cancellationToken: ct);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete apiary images for {ApiaryId}", apiaryId.Value);
            }
        }

        private static bool IsAllowedExtension(string extension)
        {
            return extension is ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif";
        }

        private static string NormalizeExtension(string extension)
        {
            if (string.IsNullOrWhiteSpace(extension))
                return ".jpg";

            return extension.ToLowerInvariant() switch
            {
                ".jpeg" => ".jpg",
                ".jfif" => ".jpg",
                _ => extension.ToLowerInvariant()
            };
        }

        private static string GetContentType(string extension, string? contentType)
        {
            if (!string.IsNullOrWhiteSpace(contentType) && contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                return contentType;

            return extension switch
            {
                ".jpg" => "image/jpeg",
                ".png" => "image/png",
                ".webp" => "image/webp",
                ".gif" => "image/gif",
                _ => "application/octet-stream"
            };
        }
    }
}