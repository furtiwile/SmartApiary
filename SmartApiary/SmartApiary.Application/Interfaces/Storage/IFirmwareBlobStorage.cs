using SmartApiary.Application.Common;

namespace SmartApiary.Application.Interfaces.Storage
{
    public interface IFirmwareBlobStorage : IFileStorage<FirmwareMetadata>
    { }
}
