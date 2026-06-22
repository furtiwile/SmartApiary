using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Common.DTOs
{
    public record UpdatedHiveDto(
        string Id,
        string ApiaryId,
        string Designation,
        HiveType Type,
        string SuperColor,
        int QueenAge,
        string Note,
        string? SmartScaleId,
        string? SmartScaleSerialNumber = null,
        bool IsSmartScaleActivated = false
    );
}
