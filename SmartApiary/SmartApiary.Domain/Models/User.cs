using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class User : AggregateRoot
    {
        public EntityId Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string PasswordHash { get; set; }
        public RoleType Role { get; set; }
        public bool IsActive { get; set; }

        /// <summary>
        /// Creates an instance of the user
        /// </summary>
        /// <param name="id"></param>
        /// <param name="email"></param>
        /// <param name="firstName"></param>
        /// <param name="lastName"></param>
        /// <param name="phoneNumber"></param>
        /// <param name="passwordHash"></param>
        /// <param name="role"></param>
        /// <param name="isActive"></param>
        private User(
            EntityId id, 
            string email, 
            string firstName, 
            string lastName, 
            string phoneNumber,
            string passwordHash, 
            RoleType role, 
            bool isActive = true
        )
        {
            Id = id;
            Email = email;
            FirstName = firstName;
            LastName = lastName;
            PhoneNumber = phoneNumber;
            PasswordHash = passwordHash;
            Role = role;
            IsActive = isActive;
        }

        /// <summary>
        /// Validates the user data and creates the user
        /// </summary>
        /// <param name="email"></param>
        /// <param name="firstName"></param>
        /// <param name="lastName"></param>
        /// <param name="phoneNumber"></param>
        /// <param name="password"></param>
        /// <param name="role"></param>
        /// <param name="active"></param>
        /// <returns></returns>
        public static Result<User> Create(
            string email, 
            string firstName, 
            string lastName,
            string phoneNumber, 
            string password, 
            RoleType role, 
            bool active = true
        )
        {
            if (string.IsNullOrWhiteSpace(email))
                return Result<User>.Failure("Email is required");

            if (string.IsNullOrWhiteSpace(firstName))
                return Result<User>.Failure("First name is required");

            if (string.IsNullOrWhiteSpace(lastName))
                return Result<User>.Failure("Last name is required");

            if (string.IsNullOrWhiteSpace(phoneNumber))
                return Result<User>.Failure("Phone number is required");

            if (string.IsNullOrWhiteSpace(password))
                return Result<User>.Failure("Password is required");

            return Result<User>.Success(
                new User(
                    EntityId.New(),
                    email,
                    firstName,
                    lastName,
                    phoneNumber,
                    password,
                    role,
                    active
                )
            );
        }

        /// <summary>
        /// Loads the existing user
        /// </summary>
        /// <param name="id"></param>
        /// <param name="email"></param>
        /// <param name="firstName"></param>
        /// <param name="lastName"></param>
        /// <param name="phoneNumber"></param>
        /// <param name="password"></param>
        /// <param name="role"></param>
        /// <param name="active"></param>
        /// <returns>User if parameters are valid, error details otherwise</returns>
        public static Result<User> Load(
            string id,
            string email,
            string firstName,
            string lastName,
            string phoneNumber,
            string password,
            RoleType role,
            bool active = true
        )
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<User>.Failure("Invalid user id");

            return Result<User>.Success(
                new User(
                    idResult.Value,
                    email,
                    firstName,
                    lastName,
                    phoneNumber,
                    password,
                    role,
                    active
                )
            );

        }

    }
}