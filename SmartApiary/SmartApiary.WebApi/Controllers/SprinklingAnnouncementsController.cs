using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.SprinklingAnnouncements.Commands;
using SmartApiary.Application.Features.SprinklingAnnouncements.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SprinklingAnnouncementsController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSprinklingAnnouncementCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            if (result.IsSuccess)
                return Ok(new { id = result.Value });

            return result.ToActionResult();
        }

        [HttpPost("{announcementId}/cancel")]
        public async Task<IActionResult> Cancel(
            [FromRoute] string announcementId,
            [FromQuery] string parcelId,
            CancellationToken ct)
        {
            var cmd = new CancelSprinklingAnnouncementCommand
            {
                ParcelId = parcelId,
                AnnouncementId = announcementId
            };

            var result = await mediator.Send(cmd, ct);
            return result.ToActionResult();
        }

        [HttpPost("{announcementId}/reschedule")]
        public async Task<IActionResult> Reschedule(
            [FromRoute] string announcementId,
            [FromBody] RescheduleSprinklingAnnouncementCommand body,
            CancellationToken ct)
        {
            var cmd = body with { AnnouncementId = announcementId };

            var result = await mediator.Send(cmd, ct);
            return result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetByParcel([FromQuery] string parcelId, CancellationToken ct)
        {
            var result = await mediator.Send(new GetSprinklingAnnouncementsByParcelQuery(parcelId), ct);
            return result.ToActionResult();
        }
    }
}
