using SmartGrid.Domain.Enums;

namespace SmartGrid.Domain.Models
{
    public class User
    {
        public Guid Id { get; set; } = new Guid();
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public RoleType Role { get; set; } = RoleType.Beekeeper;
        public bool IsActive { get; set; }
    }
}