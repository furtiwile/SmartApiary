using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Crops.Commands;
using SmartApiary.Application.Features.Crops.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CropsController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCropCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            if (result.IsSuccess)
                return Ok(new { id = result.Value });

            return result.ToActionResult();
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var result = await mediator.Send(new GetAllCropsQuery(), ct);
            return result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetByParcel([FromQuery] string parcelId, CancellationToken ct)
        {
            var result = await mediator.Send(new GetCropsByParcelQuery(parcelId), ct);
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] SmartApiary.WebApi.DTOs.UpdateCropRequest request, CancellationToken ct)
        {
            var result = await mediator.Send(request.ToCommand(id), ct);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, [FromQuery] string parcelId, CancellationToken ct)
        {
            var result = await mediator.Send(new DeleteCropCommand(parcelId, id), ct);
            return result.ToActionResult();
        }
    }
}
