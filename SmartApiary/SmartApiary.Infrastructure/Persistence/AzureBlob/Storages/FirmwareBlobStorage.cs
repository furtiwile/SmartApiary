using Azure.Storage.Blobs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Common;
using SmartApiary.Application.Common.Extensions;
using SmartApiary.Application.Interfaces.Storage;
using SmartApiary.Infrastructure.Common.Options;

namespace SmartApiary.Infrastructure.Persistence.AzureBlob.Storages
{
    internal class FirmwareBlobStorage(
        BlobServiceClient blobServiceClient,
        ILogger<FirmwareBlobStorage> logger,
        IOptions<AzureBlobOptions> options
    )
        : AzureBlobStorage<FirmwareMetadata>(
            blobServiceClient.GetBlobContainerClient(options.Value.FirmwareBlob),
            logger),
          IFirmwareBlobStorage
    {
        public override string GetBlobPath(FirmwareMetadata metadata)
        {
            return FirmwarePathExtensions.GetFirmwareBlobPath(metadata);
        }
    }
}
