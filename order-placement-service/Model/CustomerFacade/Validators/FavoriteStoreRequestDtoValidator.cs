using FluentValidation;
using order_placement_service.Model.CustomerFacade.Store;

namespace order_placement_service.Model.CustomerFacade.Validators
{
    public class FavoriteStoreRequestDtoValidator : AbstractValidator<FavoriteStoreRequestDto>
    {
        public FavoriteStoreRequestDtoValidator()
        {
            RuleFor(x => x.Store).NotNull();
        }
    }
}
