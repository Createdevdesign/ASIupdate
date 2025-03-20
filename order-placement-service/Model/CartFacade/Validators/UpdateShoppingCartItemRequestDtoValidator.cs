using FluentValidation;
using order_placement_service.Model.CartFacade.ShoppingCart;

namespace order_placement_service.Model.CartFacade.Validators
{
    public class UpdateShoppingCartItemRequestDtoValidator : AbstractValidator<UpdateShoppingCartItemRequestDto>
    {
        public UpdateShoppingCartItemRequestDtoValidator()
        {
            RuleFor(a => a.ShoppingCartTypeId).NotEqual(0);
            RuleFor(a => a.ProductId).NotNull();
            RuleFor(a => a.Quantity).NotEqual(0);
        }
    }
}
