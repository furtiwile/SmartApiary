namespace SmartApiary.Application.Interfaces.Messaging
{
    public interface IReceivedMessage<T>
    {
        T Body { get; }
        Task CompleteAsync();
    }
}
