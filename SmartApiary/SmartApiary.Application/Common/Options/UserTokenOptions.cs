namespace SmartApiary.Application.Common.Options
{
    public class UserTokenOptions
    {
        public int ActivationTokenMinutes { get; init; } = 60;
        public int ResetTokenMinutes { get; init; } = 30;
    }
}
