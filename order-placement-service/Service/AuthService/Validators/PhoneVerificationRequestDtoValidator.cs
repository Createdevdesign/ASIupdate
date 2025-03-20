using FluentValidation;
using order_placement_service.Service.AuthService.PhoneValidation;

namespace order_placement_service.Service.AuthService.Validators
{
    public class PhoneVerificationRequestDtoValidator : AbstractValidator<PhoneVerificationCodeRequestDto>
    {
        public PhoneVerificationRequestDtoValidator()
        {
            RuleFor(m => m.PhoneNumber).NotEmpty();
        }
    }
}
