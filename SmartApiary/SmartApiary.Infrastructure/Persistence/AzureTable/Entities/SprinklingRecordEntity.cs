using SmartApiary.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class SprinklingRecordEntity : BaseTableEntity
    {
        public DateTime ActualStartTime { get; set; }
        public DateTime ActualEndTime { get; set; }
        public string PreparationType { get; set; } = default!;
        public double WindSpeed { get; set; } = default;
        public double Precipitation { get; set; } = default;
        public string WeatherCondition { get; set; } = default!;
        public string AnnouncementId { get; set; } = default!;
    }
}
