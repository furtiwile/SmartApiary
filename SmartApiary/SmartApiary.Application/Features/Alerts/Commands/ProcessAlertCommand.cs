using MediatR;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Alerts.Commands
{
    // COMMAND
    public record ProcessAlertCommand(Alert Alert) : IRequest<Result>;

    // HANDLER
    internal class ProcessAlertHandler(
        ILogger<ProcessAlertHandler> logger,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        IUserRepository userRepository,
        IEmailSender emailSender)
        : IRequestHandler<ProcessAlertCommand, Result>
    {
        public async Task<Result> Handle(ProcessAlertCommand request, CancellationToken ct)
        {
            var alert = request.Alert;
            string logMsg = $"[ALARM] {alert.AlertType} on {alert.DeviceId}: {alert.Message}";

            if (alert.AlertType == AlertType.Critical)
                logger.LogError(logMsg);
            else
                logger.LogWarning(logMsg);

            // Fetch the user to send the email to
            var hive = await hiveRepository.GetBySmartScaleIdAsync(alert.DeviceId, ct);
            if (hive != null)
            {
                var apiary = await apiaryRepository.GetByIdAsync(hive.ApiaryId, ct);
                if (apiary != null)
                {
                    var user = await userRepository.GetUserByIdAsync(apiary.BeekeeperId, ct);
                    if (user != null)
                    {
                        var emailMessage = new EmailMessage(
                            ToEmail: user.Email,
                            Subject: $"Smart Apiary Alert: {alert.AlertType}",
                            PlainTextContent: $"Hello {user.FirstName},\n\nWe have detected an alert on your hive ({hive.Designation}).\n\nAlert: {alert.Message}\n\nPlease check your apiary dashboard for more details.",
                            HtmlContent: $"<p>Hello {user.FirstName},</p><p>We have detected an alert on your hive (<strong>{hive.Designation}</strong>).</p><p><strong>Alert:</strong> {alert.Message}</p><p>Please check your apiary dashboard for more details.</p>"
                        );

                        await emailSender.SendAsync(emailMessage, ct);
                    }
                }
            }

            return Result.Success();
        }
    }
}