using MediatR;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Models;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    internal sealed class ProcessExpiredAnnouncementsCommandHandler(
        ISprinklingAnnouncementRepository announcementRepository,
        ISprinklingRecordRepository recordRepository,
        IParcelRepository parcelRepository,
        IWeatherService weatherService,
        ILogger<ProcessExpiredAnnouncementsCommandHandler> logger
    ) : IRequestHandler<ProcessExpiredAnnouncementsCommand, Result>
    {
        public async Task<Result> Handle(ProcessExpiredAnnouncementsCommand request, CancellationToken ct)
        {
            logger.LogInformation("[PROCESSOR] Starting automatic verification cycle for expired sprinkling announcements...");

            var allAnnouncements = await announcementRepository.GetAllAsync(ct);
            var now = DateTime.UtcNow;

            var expiredAnnouncements = allAnnouncements
                .Where(a => !a.IsCancelled && a.StartTime.AddHours(a.ExpectedDurationHours) <= now)
                .ToList();

            if (!expiredAnnouncements.Any())
            {
                logger.LogInformation("[PROCESSOR] No expired sprinkling announcements found for processing.");
                return Result.Success();
            }

            foreach (var announcement in expiredAnnouncements)
            {
                try
                {
                    var existingRecords = await recordRepository.GetByAnnouncementIdAsync(announcement.Id, ct);
                    if (existingRecords.Any())
                    {
                        continue;
                    }

                    var parcel = await parcelRepository.GetByIdAsync(announcement.ParcelId, ct);
                    if (parcel == null)
                    {
                        logger.LogWarning("[PROCESSOR] Parcel {ParcelId} for announcement {AnnouncementId} was not found!",
                            announcement.ParcelId, announcement.Id);
                        continue;
                    }

                    double windSpeed = 0.0;
                    double precipitation = 0.0;

                    var weatherResult = await weatherService.GetWeatherAsync(parcel.Latitude, parcel.Longitude, ct);

                    if (weatherResult.IsSuccess && weatherResult.Value != null)
                    {
                        windSpeed = weatherResult.Value.WindSpeed;
                        precipitation = weatherResult.Value.Precipitation;
                    }
                    else
                    {
                        logger.LogWarning("[WEATHER] Failed to fetch weather data for parcel {ParcelId}. Defaulting to fallback parameters (0.0).", parcel.Id);
                    }

                    var actualEndTime = announcement.StartTime.AddHours(announcement.ExpectedDurationHours);

                    var recordResult = SprinklingRecord.Create(
                        announcement.StartTime,
                        actualEndTime,
                        announcement.PreparationType,
                        windSpeed,
                        precipitation,
                        announcement.Id
                    );

                    if (recordResult.IsFailure)
                    {
                        logger.LogError("[PROCESSOR] Sprinkling record domain validation failed: {Error}", recordResult.Error?.Message);
                        continue;
                    }

                    await recordRepository.SaveAsync(recordResult.Value, ct);
                    logger.LogInformation("[PROCESSOR] Automatically generated sprinkling record for announcement: {AnnouncementId}. Wind: {Wind} m/s, Precipitation: {Rain} mm.",
                        announcement.Id, windSpeed, precipitation);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[PROCESSOR] An error occurred while processing sprinkling announcement {AnnouncementId}", announcement.Id);
                }
            }

            return Result.Success();
        }
    }
}