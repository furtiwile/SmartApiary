using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.SmartScales.Commands;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize(Roles = "Beekeeper")]
    [Route("api/[controller]")]
    [ApiController]
    public class SmartScalesController(IMediator mediator) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterSmartScaleCommand command, CancellationToken ct)
        {
            if (command == null)
                return BadRequest(new { error = "Invalid or empty JSON payload." });

            var result = await mediator.Send(command, ct);
            return result.ToActionResult();
        }

        [HttpDelete("unpair/{hiveId}")]
        public async Task<IActionResult> Unpair(string hiveId, CancellationToken ct)
        {
            var result = await mediator.Send(new UnpairSmartScaleCommand(hiveId), ct);
            return result.ToActionResult();
        }

        [HttpGet("unpaired")]
        public async Task<IActionResult> GetUnpaired(CancellationToken ct)
        {
            var result = await mediator.Send(new SmartApiary.Application.Features.SmartScales.Queries.GetUnpairedSmartScalesQuery(), ct);
            return result.ToActionResult();
        }

        [HttpPost]
        public async Task<IActionResult> Create(CancellationToken ct)
        {
            var result = await mediator.Send(new SmartApiary.Application.Features.SmartScales.Commands.CreateSmartScaleCommand(), ct);
            return result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetByBeekeeper(CancellationToken ct)
        {
            var result = await mediator.Send(new SmartApiary.Application.Features.SmartScales.Queries.GetSmartScalesByBeekeeperQuery(), ct);
            return result.ToActionResult();
        }

        [HttpPut("{id}/threshold")]
        public async Task<IActionResult> UpdateThreshold(string id, [FromBody] UpdateSmartScaleThresholdCommand command, CancellationToken ct)
        {
            if (id != command.SmartScaleId)
                return BadRequest(new { error = "Mismatched smart scale ID." });

            var result = await mediator.Send(command, ct);
            return result.ToActionResult();
        }
    }
}
