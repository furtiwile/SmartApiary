
using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Auth.Commands;

namespace SmartApiary.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IMediator mediator) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand cmd, CancellationToken ct)
        {
            try
            {
                var result = await mediator.Send(cmd, ct);
                if (result.IsFailure)
                    return Unauthorized(new { message = result.Error?.Message ?? "Login failed" });

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
}
