using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using SmartApiary.Application.Features.Telemetries.Commands;
using SmartApiary.Functions.Extensions;

namespace SmartApiary.Functions.Ingestion
{
    internal class IngestTelemetry(IMediator mediator)
    {
        [Function("IngestTelemetry")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "telemetry")] HttpRequest req)
        {
            if (!req.Headers.TryGetValue("X-Device-Token", out var tokenValues))
                return new BadRequestObjectResult(new { error = "Missing X-Device-Token header." });

            var command = await req.ReadFromJsonAsync<IngestTelemetryCommand>();
            if (command == null)
                return new BadRequestObjectResult(new { error = "Invalid or empty JSON payload." });

            var deviceToken = tokenValues.ToString();
            var updatedCommand = command with { DeviceToken = deviceToken };

            var result = await mediator.Send(updatedCommand);
            return result.ToActionResult();
        }
    }
}
