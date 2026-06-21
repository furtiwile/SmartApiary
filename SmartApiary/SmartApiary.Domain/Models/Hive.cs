using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class Hive
    {
        public EntityId Id { get; private set; }
        public string Designation { get; private set; }
        public HiveType Type { get; private set; }
        public string SuperColor { get; private set; }
        public int QueenAge { get; private set; }
        public string Note { get; private set; } = string.Empty;
        public EntityId ApiaryId { get; private set; }
        public EntityId? SmartScaleId { get; private set; }

        public void PairSmartScale(EntityId smartScaleId)
        {
            SmartScaleId = smartScaleId;
        }

        public void UnpairSmartScale()
        {
            SmartScaleId = null;
        }

        public void MoveToApiary(EntityId apiaryId)
        {
            ApiaryId = apiaryId;
        }

        public ICollection<HiveInspection> Inspections { get; private set; } = [];

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
            EntityId? smartScaleId
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
            EntityId? smartScaleId
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

            // SmartScaleId is optional — a hive may not have a paired scale

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

        /// <summary>
        /// Loads the existing hive
        /// </summary>
        /// <param name="id"></param>
        /// <param name="designation"></param>
        /// <param name="type"></param>
        /// <param name="superColor"></param>
        /// <param name="queenAge"></param>
        /// <param name="note"></param>
        /// <param name="apiaryId"></param>
        /// <param name="smartScaleId"></param>
        /// <returns>Hive if all parameters are valid, error details otherwise</returns>
        public static Result<Hive> Load(
            string id,
            string designation,
            HiveType type,
            string superColor,
            int queenAge,
            string note,
            string apiaryId,
            string? smartScaleId
        )
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<Hive>.Failure("Invalid hive id");

            var apiaryIdResult = EntityId.Create(apiaryId);
            if (apiaryIdResult.IsFailure)
                return Result<Hive>.Failure("Invalid apiary id");

            EntityId? parsedSmartScaleId = null;
            if (!string.IsNullOrWhiteSpace(smartScaleId))
            {
                var smartScaleIdResult = EntityId.Create(smartScaleId);
                if (smartScaleIdResult.IsFailure)
                    return Result<Hive>.Failure("Invalid smart scale id");
                parsedSmartScaleId = smartScaleIdResult.Value;
            }

            return Result<Hive>.Success(
                new Hive(
                    idResult.Value,
                    designation,
                    type,
                    superColor,
                    queenAge,
                    note,
                    apiaryIdResult.Value,
                    parsedSmartScaleId
                )
            );
        }

        public void Update(string designation, HiveType type, string superColor, int queenAge, string note, EntityId? smartScaleId)
        {
            Designation = designation;
            Type = type;
            SuperColor = superColor;
            QueenAge = queenAge;
            Note = note;
            SmartScaleId = smartScaleId;
        }
    }
}