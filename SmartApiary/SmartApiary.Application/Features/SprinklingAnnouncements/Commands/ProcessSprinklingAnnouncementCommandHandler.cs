using MediatR;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Collections.Generic;
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
        ISprinklingNotificationService notificationService,
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

            var allApiaries = await apiaryRepository.GetApiariesWithinRadiusAsync(parcel.Latitude, parcel.Longitude, 1.0, ct);
            var apiariesWithin5Km = new List<SmartApiary.Domain.Models.Apiary>();

            foreach (var apiary in allApiaries)
            {
                double distance = CalculateHaversineDistance(parcel.Latitude, parcel.Longitude, apiary.Latitude, apiary.Longitude);
                if (distance <= 5.0)
                {
                    apiariesWithin5Km.Add(apiary);
                }
            }

            if (!apiariesWithin5Km.Any())
            {
                announcement.SetNotifiedCount(0);
                await announcementRepository.UpdateAsync(announcement, ct);
                await notificationService.BroadcastNotifiedCountToFarmerAsync(announcement.Id.Value, 0, ct);
                return Result.Success();
            }

            var userIds = apiariesWithin5Km.Select(a => a.BeekeeperId.Value).Distinct().ToList();
            int notifiedCount = 0;

            foreach (var userIdString in userIds)
            {
                var userIdResult = EntityId.Create(userIdString);
                if (userIdResult.IsFailure) continue;

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
                    await notificationService.SendAlertToBeekeeperAsync(userIdString, subject, message, ct);

                    notifiedCount++;
                }
            }

            announcement.SetNotifiedCount(notifiedCount);
            await announcementRepository.UpdateAsync(announcement, ct);

            await notificationService.BroadcastNotifiedCountToFarmerAsync(announcement.Id.Value, notifiedCount, ct);

            logger.LogInformation("Notified {Count} beekeepers for announcement {Id}.", notifiedCount, request.AnnouncementId);
            return Result.Success();
        }

        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            double r = 6371.0;
            double dLat = ToRadians(lat2 - lat1);
            double dLon = ToRadians(lon2 - lon1);
            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            double c = 2 * Math.Asin(Math.Sqrt(a));
            return r * c;
        }

        private static double ToRadians(double angle)
        {
            return (Math.PI / 180) * angle;
        }
    }
}