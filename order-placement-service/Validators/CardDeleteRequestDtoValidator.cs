using FluentValidation;
using order_placement_service.Model.Card;

namespace order_placement_service.Validators
{
    public class CardDeleteRequestDtoValidator : AbstractValidator<CardDeleteRequestDto>
    {
        public CardDeleteRequestDtoValidator()
        {
            RuleFor(x => x.CardId).NotEmpty();
            RuleFor(x => x.CardId).NotNull();
            RuleFor(x => x.CustomerId).NotEmpty();
            RuleFor(x => x.CustomerId).NotNull();
        }
    }
}
