namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class UserEntity : BaseTableEntity
    {
        public string Email { get; set; } = default!;
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string PhoneNumber { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;
        public string Role { get; set; } = default!;
        public bool IsActive { get; set; } = true;
    }
}
