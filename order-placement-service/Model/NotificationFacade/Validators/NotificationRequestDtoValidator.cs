using FluentValidation;

namespace order_placement_service.Model.NotificationFacade.Validators
{
    public class NotificationRequestDtoValidator:AbstractValidator<NotificationRequestDto>
    {
        public NotificationRequestDtoValidator()
        {
            RuleFor(x => x.OrderNumber).NotNull();
            RuleFor(x => x.OrderNumber).NotEmpty();
            RuleFor(x => x.StoreId).NotNull();
            RuleFor(x => x.StoreId).NotEmpty();
        }
    }
}
