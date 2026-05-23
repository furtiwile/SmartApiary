using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Domain.Models
{
    public class Hive
    {
        public EntityId Id { get; set; }
        public string Designation { get; set; }
        public HiveType Type { get; set; }
        public string SuperColor { get; set; }
        public int QueenAge { get; set; }
        public string Note { get; set; } = string.Empty;
        public EntityId ApiaryId { get; set; }
        public EntityId SmartScaleId { get; set; } ///< note, maybe make it nullable if smart scale devices are not enforced

        public ICollection<HiveInspection> Inspections { get; set; } = [];

        /// <summary>
        /// Creates an instance of the hive
        /// </summary>
        /// <param name="id"></param>
        /// <param name="designation"></param>
        /// <param name="type"></param>
        /// <param name="superColor"></param>
        /// <param name="queenAge"></param>
        /// <param name="note"></param>
        /// <param name="apiaryId"></param>
        /// <param name="smartScaleId"></param>
        private Hive(
            EntityId id,
            string designation, 
            HiveType type, 
            string superColor, 
            int queenAge, 
            string note,
            EntityId apiaryId,
            EntityId smartScaleId
        )
        {
            Id = id;
            Designation = designation;
            Type = type;
            SuperColor = superColor;
            QueenAge = queenAge;
            Note = note;
            ApiaryId = apiaryId;
            SmartScaleId = smartScaleId;
        }

        /// <summary>
        /// Validates the hive data and creates the hive
        /// </summary>
        /// <param name="designation"></param>
        /// <param name="type"></param>
        /// <param name="superColor"></param>
        /// <param name="queenAge"></param>
        /// <param name="note"></param>
        /// <param name="apiaryId"></param>
        /// <param name="smartScaleId"></param>
        /// <returns>Hive if all parameters are valid, error details otherwise</returns>
        public static Result<Hive> Create(
            string designation,
            HiveType type,
            string superColor,
            int queenAge,
            string note,
            EntityId apiaryId,
            EntityId smartScaleId
        )
        {
            if (string.IsNullOrWhiteSpace(designation))
                return Result<Hive>.Failure("Designation is required");

            if (string.IsNullOrWhiteSpace(superColor))
                return Result<Hive>.Failure("Super color is required");

            if (queenAge < 1)
                return Result<Hive>.Failure("Invalid queen age");

            if (apiaryId == null || string.IsNullOrWhiteSpace(apiaryId.Value))
                return Result<Hive>.Failure("Apiary ID is required");

            if (smartScaleId == null || string.IsNullOrWhiteSpace(smartScaleId.Value))
                return Result<Hive>.Failure("Smart Scale ID is required");

            return Result<Hive>.Success(
                new Hive(
                    EntityId.New(),
                    designation,
                    type,
                    superColor,
                    queenAge,
                    note,
                    apiaryId,
                    smartScaleId
                )
            );
        }
    }
}