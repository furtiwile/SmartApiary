using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Parcels.Commands;
using SmartApiary.Application.Features.Parcels.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ParcelsController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateParcelCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            if (result.IsSuccess)
                return Ok(new { id = result.Value });

            return result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetByFarmer([FromQuery] string farmerId, CancellationToken ct)
        {
            var result = await mediator.Send(new GetParcelsByFarmerQuery(farmerId), ct);
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] SmartApiary.WebApi.DTOs.UpdateParcelRequest request, CancellationToken ct)
        {
            var result = await mediator.Send(request.ToCommand(id), ct);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var result = await mediator.Send(new DeleteParcelCommand(id), ct);
            return result.ToActionResult();
        }
    }
}
