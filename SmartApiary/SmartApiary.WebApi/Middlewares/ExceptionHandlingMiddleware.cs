using FluentValidation;
using System.Net;
using System.Text.Json;

namespace SmartApiary.WebApi.Middlewares
{
    internal sealed class ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                var exception = UnpackException(ex);
                await HandleExceptionAsync(context, exception);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var (statusCode, message, errorType) = exception switch
            {
                ValidationException validationEx =>
                    (HttpStatusCode.BadRequest, validationEx.Message, "Validation"),

                UnauthorizedAccessException unauthorizedEx =>
                    (HttpStatusCode.Unauthorized, unauthorizedEx.Message, "Unauthorized"),

                KeyNotFoundException keyNotFoundEx =>
                    (HttpStatusCode.NotFound, keyNotFoundEx.Message, "NotFound"),

                ArgumentException argumentEx =>
                    (HttpStatusCode.BadRequest, argumentEx.Message, "Validation"),

                _ =>
                    (HttpStatusCode.InternalServerError, "An unexpected server error occurred.", "Unexpected")
            };

            if (statusCode == HttpStatusCode.InternalServerError)
            {
                logger.LogError(exception, "[FATAL] Unhandled exception occurred during request execution. TraceIdentifier: {TraceId}", 
                    context.TraceIdentifier);
            }
            else
            {
                logger.LogWarning("[API ERROR] Request exception handled: {Message}. TraceIdentifier: {TraceId}", 
                    exception.Message, context.TraceIdentifier);
            }

            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";

            object? errorsObject = null;
            if (exception is ValidationException && !string.IsNullOrWhiteSpace(message))
            {
                try
                {
                    // Attempt to parse validation error JSON if it's serialized
                    errorsObject = JsonSerializer.Deserialize<Dictionary<string, string[]>>(message);
                }
                catch
                {
                    errorsObject = new Dictionary<string, string[]> { { string.Empty, [message] } };
                }
            }

            var response = new
            {
                type = errorType,
                errors = errorsObject,
                message = exception is not ValidationException ? message : "Validation failed.",
                traceId = context.TraceIdentifier
            };

            await context.Response.WriteAsJsonAsync(response);
        }

        private static Exception UnpackException(Exception ex)
        {
            while (ex.InnerException != null && 
                   (ex is System.AggregateException || ex is System.Reflection.TargetInvocationException))
            {
                ex = ex.InnerException;
            }
            return ex;
        }
    }
}
