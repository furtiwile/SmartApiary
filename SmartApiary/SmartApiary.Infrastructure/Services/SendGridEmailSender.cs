using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Common.Options;
using SmartApiary.Application.Interfaces;

namespace SmartApiary.Infrastructure.Services
{
    internal class SendGridEmailSender(IOptions<EmailOptions> options) : IEmailSender
    {
        private readonly EmailOptions _options = options.Value;

        public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
        {
            var apiKey = _options.SendGridApiKey;
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                // In local dev, if no API key provided, just skip sending
                return;
            }

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(_options.FromEmail, _options.FromName);
            var to = new EmailAddress(message.ToEmail);

            var msg = MailHelper.CreateSingleEmail(from, to, message.Subject, message.PlainTextContent, message.HtmlContent);

            var response = await client.SendEmailAsync(msg, ct);
            // swallow failures here; logging could be added
        }
    }
}
