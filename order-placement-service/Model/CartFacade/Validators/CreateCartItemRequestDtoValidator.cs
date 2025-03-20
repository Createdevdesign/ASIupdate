using FluentValidation;
using order_placement_service.Model.CartFacade.ShoppingCart;

namespace order_placement_service.Model.CartFacade.Validators
{
    public class CreateCartItemRequestDtoValidator : AbstractValidator<CreateCartItemRequestDto>
    {
        public CreateCartItemRequestDtoValidator()
        {
            RuleFor(a => a.ShoppingCartTypeId).NotEqual(0);
            RuleFor(a => a.ProductId).NotNull();
            RuleFor(a => a.Quantity).NotEqual(0);
            //RuleFor(a => a.AdditionalComments).NotNull();
        }
    }
}
