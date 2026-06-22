using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Users.Commands;
using SmartApiary.Application.Features.Users.Queries;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController(IMediator mediator) : ControllerBase
    {
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings(CancellationToken ct)
        {
            var result = await mediator.Send(new GetUserSettingsQuery(), ct);
            return result.ToActionResult();
        }

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateUserSettingsCommand command, CancellationToken ct)
        {
            var result = await mediator.Send(command, ct);
            return result.ToActionResult();
        }
    }
}
