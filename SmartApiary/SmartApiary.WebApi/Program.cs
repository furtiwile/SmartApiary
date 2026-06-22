using Microsoft.OpenApi;
using SmartApiary.Application.Interfaces;
using SmartApiary.WebApi.Extensions;
using SmartApiary.WebApi.Hubs;
using SmartApiary.WebApi.Middlewares;
using SmartApiary.WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

var webApiConfig = builder.Configuration.GetSection("WebApi");
string corsPolicyName = webApiConfig.GetValue<string>("CorsPolicyName") ?? "_reactAppPolicy";
string reactOrigin = webApiConfig.GetValue<string>("ReactOrigin") ?? "http://localhost:5173";
string deviceHubRoute = webApiConfig.GetValue<string>("DeviceHubRoute") ?? "/device-status-hub";

builder.Services
    .AddWebApiServices(builder.Configuration)
    .AddWebApiCors(reactOrigin)
    .AddWebApiSignalR()
    .AddWebApiHostedServices();

builder.Services.AddScoped<ISprinklingNotificationService,SignalRSprinklingNotificationService>();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors(corsPolicyName);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options =>
    {
        options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_1;
    });
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<DeviceHub>(deviceHubRoute);
app.MapControllers();

app.Run();
