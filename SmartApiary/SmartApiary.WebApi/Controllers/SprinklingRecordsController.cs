using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.SprinklingRecords.Commands;
using SmartApiary.Application.Features.SprinklingRecords.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SprinklingRecordsController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSprinklingRecordCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            if (result.IsSuccess)
                return Ok(new { id = result.Value });

            return result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetByAnnouncement([FromQuery] string announcementId, CancellationToken ct)
        {
            var result = await mediator.Send(new GetSprinklingRecordsByAnnouncementQuery(announcementId), ct);
            return result.ToActionResult();
        }
    }
}
