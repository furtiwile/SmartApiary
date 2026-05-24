namespace SmartApiary.Functions.Ingestion;

/* TODO: DELETE
internal class ReceiveDevice(IMediator mediator)
{
    [Function("ReceiveDevice")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
    {
        AddNewDeviceCommand? command = await req.ReadFromJsonAsync<AddNewDeviceCommand>();

        if (command == null) return new BadRequestObjectResult(new { error = "Invalid or empty JSON payload." });

        Result<string> result = await mediator.Send(command);

        return result.ToActionResult();
    }
}
*/