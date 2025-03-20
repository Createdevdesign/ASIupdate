using FluentValidation;
using order_placement_service.Model.NotificationFacade.Sms;

namespace order_placement_service.Model.NotificationFacade.Validators
{
    public class SMSRequestDtoValidator : AbstractValidator<SMSRequestDto>
    {
        public SMSRequestDtoValidator()
        {
            RuleFor(x => x.Mobile).NotEmpty();
            RuleFor(x => x.Mobile).NotNull();
            RuleFor(x => x.OrderNo).NotEmpty();
            RuleFor(x => x.OrderNo).NotNull();
            RuleFor(x => x.Message).NotEmpty();
            RuleFor(x => x.Message).NotNull();
        }
    }
}
