using FluentValidation;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Common.Validators
{
    internal static class Validator
    {
        public static IRuleBuilderOptions<T, DeviceType> IsValidDeviceType<T>(this IRuleBuilder<T, DeviceType> ruleBuilder)
        {
            return ruleBuilder
                            .IsInEnum().WithMessage("Invalid device type.")
                            .NotEqual(DeviceType.Unknown).WithMessage("DeviceType cannot be Unknown.");
        }

    }
}
