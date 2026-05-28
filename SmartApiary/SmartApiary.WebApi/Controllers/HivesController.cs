using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Hives.Commands;
using SmartApiary.Application.Features.Hives.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize(Roles = "Beekeeper")]
    [Route("api/[controller]")]
    [ApiController]
    public class HivesController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHiveCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            return result.IsSuccess
                ? Ok(new { id = result.Value })
                : result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetByApiary([FromQuery] string apiaryId, CancellationToken ct)
        {
            var result = await mediator.Send(new GetHivesByApiaryQuery(apiaryId), ct);
            return result.ToActionResult();
        }
    }
}
