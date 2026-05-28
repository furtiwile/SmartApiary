namespace SmartApiary.Application.Interfaces
{
    public interface IUserTokenSettings
    {
        int ActivationTokenMinutes { get; }
        int ResetTokenMinutes { get; }
    }
}
