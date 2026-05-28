namespace SmartApiary.Application.Features.Apiaries
{
    public record UploadedApiaryImageFile
    {
        public string FileName { get; init; } = string.Empty;
        public string ContentType { get; init; } = string.Empty;
        public byte[] Content { get; init; } = [];
    }
}