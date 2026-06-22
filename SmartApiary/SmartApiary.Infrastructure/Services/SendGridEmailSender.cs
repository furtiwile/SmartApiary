using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Common.Options;
using SmartApiary.Application.Interfaces;

namespace SmartApiary.Infrastructure.Services
{
    internal class SendGridEmailSender(
        IOptions<EmailOptions> options,
        ILogger<SendGridEmailSender> logger
    ) : IEmailSender
    {
        private readonly EmailOptions _options = options.Value;

        public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
        {
            try
            {
                var apiKey = _options.SendGridApiKey;
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    // In local dev, if no API key provided, just skip sending
                    logger.LogInformation("[EMAIL] SendGrid API Key is empty. Skipping email delivery to {Email}", message.ToEmail);
                    return;
                }

                var client = new SendGridClient(apiKey);
                var from = new EmailAddress(_options.FromEmail, _options.FromName);
                var to = new EmailAddress(message.ToEmail);

                var msg = MailHelper.CreateSingleEmail(from, to, message.Subject, message.PlainTextContent, message.HtmlContent);

                var response = await client.SendEmailAsync(msg, ct);
                
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogWarning("[EMAIL] Failed to send email to {Email}. Status Code: {StatusCode}", 
                        message.ToEmail, response.StatusCode);
                }
                else
                {
                    logger.LogInformation("[EMAIL] Email sent successfully to {Email}.", message.ToEmail);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[EMAIL] Exception thrown while attempting to send email to {Email}", message.ToEmail);
            }
        }
    }
}
