using FluentValidation;
using order_placement_service.Model.CartFacade.ShoppingCart;

namespace order_placement_service.Model.CartFacade.Validators
{
   public class DeleteShoppingCartItemRequestDtoValidator : AbstractValidator<DeleteShoppingCartItemRequestDto>
    {
        public DeleteShoppingCartItemRequestDtoValidator()
        {
            RuleFor(a => a.CartId).NotNull();
        }
    }
}
