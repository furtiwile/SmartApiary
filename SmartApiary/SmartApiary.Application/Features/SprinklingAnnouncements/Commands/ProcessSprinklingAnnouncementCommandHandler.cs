using MediatR;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    internal sealed class ProcessSprinklingAnnouncementCommandHandler(
        ISprinklingAnnouncementRepository announcementRepository,
        IParcelRepository parcelRepository,
        IApiaryRepository apiaryRepository,
        IUserRepository userRepository,
        IEmailSender emailSender,
        ILogger<ProcessSprinklingAnnouncementCommandHandler> logger
    ) : IRequestHandler<ProcessSprinklingAnnouncementCommand, Result>
    {
        public async Task<Result> Handle(ProcessSprinklingAnnouncementCommand request, CancellationToken ct)
        {
            var announcementIdResult = EntityId.Create(request.AnnouncementId);
            if (announcementIdResult.IsFailure)
                return Result.Failure("Invalid announcement ID", ErrorType.Validation);

            var announcement = await announcementRepository.GetByIdAsync(announcementIdResult.Value, ct);
            if (announcement == null)
                return Result.Failure("Announcement not found", ErrorType.NotFound);

            var parcel = await parcelRepository.GetByIdAsync(announcement.ParcelId, ct);
            if (parcel == null)
                return Result.Failure("Parcel not found", ErrorType.NotFound);

            var apiaries = await apiaryRepository.GetApiariesWithinRadiusAsync(parcel.Latitude, parcel.Longitude, 5000, ct);

            if (!apiaries.Any())
            {
                logger.LogInformation("No apiaries found within 5km radius for announcement {Id}.", request.AnnouncementId);
                return Result.Success();
            }

            var userIds = apiaries.Select(a => a.BeekeeperId.Value).Distinct().ToList();

            foreach (var userIdString in userIds)
            {
                var userIdResult = EntityId.Create(userIdString);
                if (userIdResult.IsSuccess)
                {
                    var user = await userRepository.GetUserByIdAsync(userIdResult.Value, ct);
                    if (user != null)
                    {
                        string subject = $"Sprinkling Announcement: {request.ActionType}";
                        string message = $"A sprinkling announcement has been {request.ActionType.ToString().ToLower()} near your apiaries.\n" +
                                         $"Scheduled for: {announcement.StartTime.ToLocalTime():yyyy-MM-dd HH:mm}\n" +
                                         $"Duration: {announcement.ExpectedDurationHours} hours\n" +
                                         $"Preparation: {announcement.PreparationType}";

                        var emailMessage = new EmailMessage(
                            ToEmail: user.Email,
                            Subject: subject,
                            PlainTextContent: $"Hello {user.FirstName},\n\n{message}",
                            HtmlContent: $"<p>Hello {user.FirstName},</p><p>{message.Replace("\n", "<br/>")}</p>"
                        );

                        await emailSender.SendAsync(emailMessage, ct);
                    }
                }
            }

            return Result.Success();
        }
    }
}
