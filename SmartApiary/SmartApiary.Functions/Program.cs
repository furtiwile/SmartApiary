using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartApiary.Application;
using SmartApiary.Application.Interfaces;
using SmartApiary.Functions.Middlewares;
using SmartApiary.Functions.Services;
using SmartApiary.Infrastructure;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = FunctionsApplication.CreateBuilder(args);

// Load configuration files manually for local/direct debugging
builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();

// HTTP API JSON configuration
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.SerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
});

// Internal configuration for serialization
builder.Services.Configure<JsonSerializerOptions>(options =>
{
    options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.PropertyNameCaseInsensitive = true;
    options.Converters.Add(new JsonStringEnumConverter());
    options.NumberHandling = JsonNumberHandling.AllowReadingFromString;
});

builder.ConfigureFunctionsWebApplication();

// Add Exception Handling Middleware
builder.UseMiddleware<ExceptionHandlingMiddleware>();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

// Add Infrastructure and Application services
builder.Services
    .AddInfrastructure(builder.Configuration)
    .AddApplication();
builder.Services.AddScoped<ISprinklingNotificationService,NullSprinklingNotificationService>();
builder.Build().Run();
