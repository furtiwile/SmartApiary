namespace SmartApiary.Infrastructure.Common.Options
{
    internal class AzureBlobOptions
    {
        public string ConnectionString { get; init; } = string.Empty;

        public string ApiaryImagesBlob { get; init; } = string.Empty;
    }
}
