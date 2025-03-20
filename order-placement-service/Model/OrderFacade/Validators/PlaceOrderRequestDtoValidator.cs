using FluentValidation;
using order_placement_service.Model.OrderFacade.Order;

namespace order_placement_service.Model.OrderFacade.Validators
{
    public class PlaceOrderRequestDtoValidator : AbstractValidator<PlaceOrderRequestDto>
    {
        public PlaceOrderRequestDtoValidator()
        {
            RuleFor(x => x.StoreId).NotEmpty();
            RuleFor(x => x.StoreId).NotNull();
            //RuleFor(x => x.Token).NotEmpty();
            //RuleFor(x => x.Token).NotNull();
        }
    }
}
