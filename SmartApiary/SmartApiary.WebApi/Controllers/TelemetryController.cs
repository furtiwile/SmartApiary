using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Telemetries.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TelemetryController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetBySmartScale([FromQuery] string smartScaleId, CancellationToken ct)
        {
            var result = await mediator.Send(new GetTelemetryBySmartScaleQuery(smartScaleId), ct);
            return result.ToActionResult();
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest([FromQuery] string smartScaleId, CancellationToken ct)
        {
            var result = await mediator.Send(new GetLatestTelemetryBySmartScaleQuery(smartScaleId), ct);
            return result.ToActionResult();
        }
    }
}
