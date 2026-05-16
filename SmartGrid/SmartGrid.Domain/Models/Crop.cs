using SmartGrid.Domain.Enums;

namespace SmartGrid.Domain.Models
{
    public class Crop
    {
        public Guid Id { get; set; }
        public Guid ParcelId { get; set; }
        public CropType Type { get; set; }
        public DateTime ExpectedFloweringTime { get; set; }
        public string Note { get; set; } = string.Empty;

        public Parcel Parcel { get; set; }

    }
}
