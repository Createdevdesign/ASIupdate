using FluentValidation;
using order_placement_service.Model.QICode;

namespace SwiftServe.OrderService.WebApi.Validators
{
    public class CreateQICRequestDtoValidator : AbstractValidator<CreateQICRequestDto>
    {
        public CreateQICRequestDtoValidator()
        {
            RuleFor(a => a.Metadata).NotNull();
            RuleFor(a => a.StoreId).NotNull();
            RuleFor(a => a.Type).NotNull();
        }
    }
}
