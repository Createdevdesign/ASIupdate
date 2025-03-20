using FluentValidation;
using SwiftServe.CustomerService.Facade.Payment;

namespace order_placement_service.Model.CustomerFacade.Validators
{
    public class CreditCardTransactionRequestDtoValidator : AbstractValidator<CreditCardTransactionRequestDto>
    {
        public CreditCardTransactionRequestDtoValidator()
        {
            RuleFor(x => x.CustomerId).NotEmpty();
            RuleFor(x => x.CustomerId).NotNull();
            RuleFor(x => x.OrderId).NotNull();
            RuleFor(x => x.OrderId).NotEmpty();
            RuleFor(x => x.Token).NotEmpty();
            RuleFor(x => x.Token).NotNull();
            RuleFor(x => x.Amount).NotEqual(0);
        }
    }
}
