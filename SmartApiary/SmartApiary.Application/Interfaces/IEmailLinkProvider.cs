namespace SmartApiary.Application.Interfaces
{
    public interface IEmailLinkProvider
    {
        bool ReturnLinkInResponse { get; }
        string BuildActivationLink(string token);
        string BuildResetLink(string token);
    }
}
