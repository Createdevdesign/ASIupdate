using FluentValidation;
using order_placement_service.Model.CustomerFacade.Customer;


namespace order_placement_service.Model.CustomerFacade.Validators
{
    public class UpdateUserProfileRequestDtoValidator : AbstractValidator<UpdateUserProfileRequestDto>
    {
        public UpdateUserProfileRequestDtoValidator()
        {
            RuleFor(m => m.ShippingAddress).NotNull();
        }
    }
}
