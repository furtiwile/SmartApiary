using SmartApiary.Application.Features.Parcels.Commands;

namespace SmartApiary.WebApi.DTOs
{
    public class UpdateParcelRequest
    {
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public UpdateParcelCommand ToCommand(string parcelId)
        {
            return new UpdateParcelCommand
            {
                ParcelId = parcelId,
                Name = Name,
                Latitude = Latitude,
                Longitude = Longitude
            };
        }
    }
}
