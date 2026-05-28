using SmartApiary.Application.Common.Models;

namespace SmartApiary.Application.Interfaces
{
    public interface IEmailSender
    {
        Task SendAsync(EmailMessage message, CancellationToken ct = default);
    }
}
