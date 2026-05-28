namespace SmartApiary.Application.Common.Models
{
    public record EmailMessage(
        string ToEmail,
        string Subject,
        string HtmlContent,
        string PlainTextContent
    );
}
