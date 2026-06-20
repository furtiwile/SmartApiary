using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.HiveInspections.Commands;
using SmartApiary.Application.Features.HiveInspections.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class HiveInspectionsController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHiveInspectionCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            return result.IsSuccess
                ? Ok(new { id = result.Value })
                : result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetByHive([FromQuery] string hiveId, CancellationToken ct)
        {
            var result = await mediator.Send(new GetHiveInspectionsByHiveQuery(hiveId), ct);
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] SmartApiary.WebApi.DTOs.UpdateHiveInspectionRequest request, CancellationToken ct)
        {
            var result = await mediator.Send(request.ToCommand(id), ct);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, [FromQuery] string hiveId, CancellationToken ct)
        {
            var result = await mediator.Send(new DeleteHiveInspectionCommand(hiveId, id), ct);
            return result.ToActionResult();
        }
    }
}
