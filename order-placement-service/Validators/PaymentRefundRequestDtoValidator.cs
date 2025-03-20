using FluentValidation;
using order_placement_service.Model.Payment;

namespace order_placement_service.Validators
{
    public class PaymentRefundRequestDtoValidator: AbstractValidator<PaymentRefundRequestDto>
    {
        public PaymentRefundRequestDtoValidator()
        {
            RuleFor(x => x.Charge).NotEmpty();
            RuleFor(x => x.Charge).NotNull();
            RuleFor(x => x.OrderId).NotEmpty();
            RuleFor(x => x.OrderId).NotNull();
        }
    }
}
