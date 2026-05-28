using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Geo.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GeoController(IMediator mediator) : ControllerBase
    {
        [HttpGet("apiaries-near-parcel")]
        public async Task<IActionResult> GetApiariesNearParcel(
            [FromQuery] string parcelId,
            [FromQuery] double radiusKm = 5,
            CancellationToken ct = default)
        {
            var result = await mediator.Send(new GetApiariesNearParcelQuery(parcelId, radiusKm), ct);
            return result.ToActionResult();
        }
    }
}
