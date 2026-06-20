using SmartApiary.Application.Features.Hives.Commands;
using SmartApiary.Domain.Enums;

namespace SmartApiary.WebApi.DTOs
{
    public class UpdateHiveRequest
    {
        public string Designation { get; set; } = string.Empty;
        public HiveType Type { get; set; }
        public string SuperColor { get; set; } = string.Empty;
        public int QueenAge { get; set; }
        public string Note { get; set; } = string.Empty;
        public string SmartScaleId { get; set; } = string.Empty;

        public UpdateHiveCommand ToCommand(string hiveId)
        {
            return new UpdateHiveCommand
            {
                HiveId = hiveId,
                Designation = Designation,
                Type = Type,
                SuperColor = SuperColor,
                QueenAge = QueenAge,
                Note = Note,
                SmartScaleId = SmartScaleId
            };
        }
    }
}
