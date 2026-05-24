namespace SmartApiary.Application.Interfaces
{
    public interface IParallelSettingsProvider
    {
        int MaxDegreeOfParallelism { get; }
    }
}