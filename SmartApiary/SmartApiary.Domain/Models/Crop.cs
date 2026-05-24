using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class Crop
    {
        public EntityId Id { get; set; }
        public CropType Type { get; set; }
        public DateTime ExpectedFloweringTime { get; set; }
        public string Note { get; set; } = string.Empty;
        public EntityId ParcelId { get; set; }

        /// <summary>
        /// Creates an instance of the crop
        /// </summary>
        /// <param name="id"></param>
        /// <param name="type"></param>
        /// <param name="expectedFloweringTime"></param>
        /// <param name="note"></param>
        /// <param name="parcelId"></param>
        private Crop(EntityId id, CropType type, DateTime expectedFloweringTime, string note, EntityId parcelId)
        {
            Id = id;
            Type = type;
            ExpectedFloweringTime = expectedFloweringTime;
            Note = note;
            ParcelId = parcelId;
        }

        /// <summary>
        /// Validates the crop data and creates the crop
        /// </summary>
        /// <param name="type"></param>
        /// <param name="expectedFloweringTime"></param>
        /// <param name="note"></param>
        /// <param name="parcelId"></param>
        /// <returns>Crop if all parameters are valid, error details otherwise</returns>
        public static Result<Crop> Create(CropType type, DateTime expectedFloweringTime, string note, EntityId parcelId)
        {
            if (parcelId == null || string.IsNullOrWhiteSpace(parcelId.Value))
                return Result<Crop>.Failure("Parcel ID is required");

            return Result<Crop>.Success(
                new Crop(
                    EntityId.New(),
                    type,
                    expectedFloweringTime,
                    note,
                    parcelId
                )
            );
        }

    }
}
