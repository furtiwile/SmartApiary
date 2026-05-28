using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Apiaries.Commands;
using SmartApiary.Application.Features.Apiaries.Queries;
using SmartApiary.WebApi.DTOs;
using SmartApiary.WebApi.Extensions;

namespace SmartApiary.WebApi.Controllers
{
    [Authorize(Roles = "Beekeeper")]
    [Route("api/[controller]")]
    [ApiController]
    public class ApiariesController(IMediator mediator) : ControllerBase
    {
        [Consumes("multipart/form-data")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateApiaryRequest request, CancellationToken ct)
        {
            var commandResult = await request.ToCommandAsync(ct);
            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value, ct);
            return result.IsSuccess
                ? Ok(new { id = result.Value })
                : result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetByBeekeeper(CancellationToken ct)
        {
            var result = await mediator.Send(new GetApiariesByBeekeeperQuery(), ct);
            return result.ToActionResult();
        }
    }
}
