using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using SmartApiary.Application.Features.SmartScales.Commands;
using SmartApiary.Functions.Extensions;

namespace SmartApiary.Functions.Ingestion
{
    internal class ActivateSmartScale(IMediator mediator)
    {
        [Function("ActivateSmartScale")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "smartscales/activate")] HttpRequest req)
        {
            var command = await req.ReadFromJsonAsync<ActivateSmartScaleCommand>();
            if (command == null)
                return new BadRequestObjectResult(new { error = "Invalid or empty JSON payload." });

            var result = await mediator.Send(command);
            return result.ToActionResult();
        }
    }
}
