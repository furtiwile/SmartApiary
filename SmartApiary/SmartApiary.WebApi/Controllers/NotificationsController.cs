using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Features.Notifications.Commands;
using SmartApiary.Application.Features.Notifications.Queries;
using SmartApiary.Application.Interfaces;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController(IMediator mediator, ICurrentUserContext currentUserContext) : ControllerBase
    {
        [HttpGet("unpushed")]
        public async Task<IActionResult> GetUnpushed(CancellationToken ct)
        {
            if (string.IsNullOrEmpty(currentUserContext.UserId))
                return Unauthorized();

            var result = await mediator.Send(new GetUnpushedNotificationsQuery(currentUserContext.UserId), ct);
            return result.ToActionResult();
        }

        [HttpPut("pushed")]
        public async Task<IActionResult> MarkAsPushed([FromBody] List<string> notificationIds, CancellationToken ct)
        {
            if (string.IsNullOrEmpty(currentUserContext.UserId))
                return Unauthorized();

            var result = await mediator.Send(new MarkNotificationsAsPushedCommand(currentUserContext.UserId, notificationIds), ct);
            return result.ToActionResult();
        }
    }
}
