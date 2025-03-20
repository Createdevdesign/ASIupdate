using FluentValidation;
using order_placement_service.Service.AuthService.User;

namespace order_placement_service.Service.AuthService.Validators
{
    public class RefreshTokenRequestDtoValidator : AbstractValidator<RefreshTokenRequestDto>
    {
        public RefreshTokenRequestDtoValidator()
        {
            RuleFor(m => m.DeviceId).NotEmpty();
            RuleFor(m => m.RefreshToken).NotEmpty();
        }
    }
}
