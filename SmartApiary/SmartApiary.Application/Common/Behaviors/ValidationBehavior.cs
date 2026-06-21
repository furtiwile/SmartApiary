using FluentValidation;
using MediatR;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using System.Reflection;

namespace SmartApiary.Application.Common.Behaviors;

// This class implements a validation behavior for MediatR requests. 
// It uses FluentValidation to validate incoming requests before they reach the request handler. 
// If validation fails, it creates a failure result with the validation errors serialized as a JSON string. 
// If validation passes, it proceeds to the next behavior or handler in the pipeline.
internal class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators = validators;

    public async Task<TResponse> Handle(TRequest request,
    RequestHandlerDelegate<TResponse> next,
    CancellationToken ct)
    {
        if (_validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);

            var validationResults = await Task.WhenAll(
                _validators.Select(v => v.ValidateAsync(context, ct)));

            var failures = validationResults
                .SelectMany(r => r.Errors)
                .Where(f => f != null)
                .ToList();

            if (failures.Count != 0)
            {
                var errorsDictionary = failures
                    .GroupBy(f => f.PropertyName)
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(f => f.ErrorMessage).ToArray()
                    );

                var serializedErrors = System.Text.Json.JsonSerializer.Serialize(errorsDictionary);

                return CreateValidationResult(serializedErrors);
            }
        }

        return await next(ct);
    }

    // This method creates a validation result based on the type of TResponse. If TResponse is of type Result, it returns a failure result with the provided message and an ErrorType of Validation. If TResponse is a generic Result<T>, it uses reflection to invoke the static Failure method to create a failure result. If TResponse is neither, it throws a ValidationException with the provided message.
    private TResponse CreateValidationResult(string message)
    {
        var responseType = typeof(TResponse);

        if (responseType == typeof(Result))
        {
            return (TResponse)(object)Result.Failure(message, ErrorType.Validation);
        }

        if (responseType.IsGenericType && responseType.GetGenericTypeDefinition() == typeof(Result<>))
        {
            var failureMethod = responseType.GetMethod("Failure",
                BindingFlags.Public | BindingFlags.Static);

            if (failureMethod != null)
            {
                var result = failureMethod.Invoke(null, [message, ErrorType.Validation]);
                return (TResponse)result!;
            }
        }

        throw new ValidationException(message);
    }
}