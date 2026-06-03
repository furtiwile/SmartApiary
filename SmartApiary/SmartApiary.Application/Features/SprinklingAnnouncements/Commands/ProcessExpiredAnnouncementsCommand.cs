using MediatR;
using SmartApiary.Domain.Common;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    public record ProcessExpiredAnnouncementsCommand : IRequest<Result>;
}