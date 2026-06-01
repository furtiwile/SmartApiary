using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using SmartApiary.Application.Features.SmartScales.Commands;
using SmartApiary.Functions.Extensions;

namespace SmartApiary.Functions.Ingestion
{
    internal class RegisterSmartScale(IMediator mediator)
    {
        [Function("RegisterSmartScale")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "smartscales/register")] HttpRequest req)
        {
            var command = await req.ReadFromJsonAsync<RegisterSmartScaleCommand>();
            if (command == null)
                return new BadRequestObjectResult(new { error = "Invalid or empty JSON payload." });

            var result = await mediator.Send(command);
            return result.ToActionResult();
        }
    }
}
