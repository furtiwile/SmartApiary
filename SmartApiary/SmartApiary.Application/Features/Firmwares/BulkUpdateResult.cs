namespace SmartApiary.Application.Features.Firmwares
{
    public sealed record BulkUpdateResult(
        int Total,
        int Succeeded,
        int Failed
    );
}
