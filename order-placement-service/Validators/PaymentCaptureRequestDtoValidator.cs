using FluentValidation;
using order_placement_service.Model.Payment;

namespace order_placement_service.Validators
{
    public class PaymentCaptureRequestDtoValidator: AbstractValidator<PaymentCaptureRequestDto>
    {
        public PaymentCaptureRequestDtoValidator()
        {
            RuleFor(x => x.ChargeId).NotNull();
            RuleFor(x => x.ChargeId).NotEmpty();
        }
    }
}
