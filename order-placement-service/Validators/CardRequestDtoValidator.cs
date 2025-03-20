using FluentValidation;
using order_placement_service.Model.Card;

namespace order_placement_service.Validators
{
    public class CardRequestDtoValidator : AbstractValidator<CardRequestDto>
    {
        public CardRequestDtoValidator()
        {
            RuleFor(x => x.Token).NotNull();
            RuleFor(x => x.Token).NotEmpty();
        }
    }
}
