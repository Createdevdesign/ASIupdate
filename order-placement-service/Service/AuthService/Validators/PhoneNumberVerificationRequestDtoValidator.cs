using FluentValidation;
using order_placement_service.Service.AuthService.PhoneValidation;

namespace order_placement_service.Service.AuthService.Validators
{
    public class PhoneNumberVerificationRequestDtoValidator : AbstractValidator<PhoneNumberVerificationRequestDto>
    {
        public PhoneNumberVerificationRequestDtoValidator()
        {
            RuleFor(m => m.PhoneNumber).NotEmpty();
            RuleFor(m => m.DeviceId).NotEmpty();
            RuleFor(m => m.Uuid).NotNull().NotEmpty();//.SetCollectionValidator(new GuidValidator());
            RuleFor(m => m.VerificationCode).NotNull().NotEmpty();
        }
    }
}
