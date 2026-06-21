using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SmartApiary.Application.Features.SprinklingRecords.Queries;
using SmartApiary.Application.Interfaces;

namespace SmartApiary.Infrastructure.Services
{
    internal sealed class PdfService : IPdfService
    {
        public PdfService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public Task<byte[]> GenerateSprinklingReportAsync(IReadOnlyCollection<SprinklingRecordDto> records, CancellationToken ct = default)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Black));

                    page.Header().Column(column =>
                    {
                        column.Item().Text("SMART APIARY - TREATMENT HISTORY REPORT")
                            .FontSize(16)
                            .Bold()
                            .FontColor(Colors.Green.Darken2);

                        column.Item().Text($"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Medium);

                        column.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    page.Content().PaddingTop(15).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2); // Start Time
                            columns.RelativeColumn(2); // End Time
                            columns.RelativeColumn(2); // Parcel
                            columns.RelativeColumn(2); // Crop
                            columns.RelativeColumn(2.5f); // Preparation
                            columns.RelativeColumn(2.5f); // Weather
                            columns.RelativeColumn(1.5f); // Wind
                            columns.RelativeColumn(1.5f); // Rain
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Start Time").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("End Time").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Parcel").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Crop").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Preparation").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Weather").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Wind").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Rain").Bold();
                        });

                        foreach (var record in records)
                        {
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(5)
                                .Text(record.ActualStartTime.ToString("yyyy-MM-dd HH:mm"));

                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(5)
                                .Text(record.ActualEndTime.ToString("yyyy-MM-dd HH:mm"));

                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(5)
                                .Text(record.ParcelName);

                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(5)
                                .Text(record.CropType);

                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(5)
                                .Text(record.PreparationType);

                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(5)
                                .Text(record.WeatherCondition);

                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(5)
                                .Text($"{record.WindSpeed:F1} m/s");

                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(5)
                                .Text($"{record.Precipitation:F1} mm");
                        }
                    });

                    page.Footer().AlignRight().Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
                });
            });

            using var stream = new System.IO.MemoryStream();
            document.GeneratePdf(stream);
            return Task.FromResult(stream.ToArray());
        }
    }
}