
using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Auth.Commands;
using SmartApiary.WebApi.Extensions;

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

        [HttpPost("admin-create")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminCreate([FromBody] AdminCreateUserCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            return result.ToActionResult();
        }

        [HttpPost("activate")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public async Task<IActionResult> Activate([FromBody] ActivateAccountCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            return result.ToActionResult();
        }

        [HttpPost("forgot-password")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] RequestPasswordResetCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            if (result.IsSuccess)
            {
                return Ok(new { resetLink = result.Value });
            }

            return result.ToActionResult();
        }

        [HttpPost("reset-password")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            return result.ToActionResult();
        }
    }
}
