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

        [HttpGet]
        public async Task<IActionResult> GetByBeekeeper(CancellationToken ct)
        {
            var result = await mediator.Send(new SmartApiary.Application.Features.SmartScales.Queries.GetSmartScalesByBeekeeperQuery(), ct);
            return result.ToActionResult();
        }
    }
}
