using SmartApiary.Application.Features.Crops.Commands;
using SmartApiary.Domain.Enums;

namespace SmartApiary.WebApi.DTOs
{
    public class UpdateCropRequest
    {
        public string ParcelId { get; set; } = string.Empty;
        public CropType Type { get; set; }
        public DateTime ExpectedFloweringTime { get; set; }
        public string Note { get; set; } = string.Empty;

        public UpdateCropCommand ToCommand(string cropId)
        {
            return new UpdateCropCommand
            {
                ParcelId = ParcelId,
                CropId = cropId,
                Type = Type,
                ExpectedFloweringTime = ExpectedFloweringTime,
                Note = Note
            };
        }
    }
}
