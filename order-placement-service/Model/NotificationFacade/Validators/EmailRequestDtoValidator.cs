using FluentValidation;
using order_placement_service.Model.NotificationFacade.Email;

namespace order_placement_service.Model.NotificationFacade.Validators
{
    public class EmailRequestDtoValidator : AbstractValidator<EmailRequestDto>
    {
        public EmailRequestDtoValidator()
        {
            RuleFor(x => x.Body).NotNull();
            RuleFor(x => x.Body).NotEmpty();
            RuleFor(x => x.CustomerEmail).NotNull();
            RuleFor(x => x.StoreEmail).NotEmpty();
            RuleFor(x => x.OrderNumber).NotNull();
            RuleFor(x => x.OrderNumber).NotEmpty();
            RuleFor(x => x.Subject).NotNull();
            RuleFor(x => x.Subject).NotEmpty();
        }
    }
}
