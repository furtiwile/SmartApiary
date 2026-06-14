using MediatR;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    public record ProcessSprinklingAnnouncementCommand(string AnnouncementId, AnnouncementAction ActionType) : IRequest<Result>;
}
