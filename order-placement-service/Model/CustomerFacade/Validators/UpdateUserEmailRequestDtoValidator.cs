using FluentValidation;
using order_placement_service.Model.CustomerFacade.Customer;


namespace order_placement_service.Model.CustomerFacade.Validators
{
    public class UpdateUserEmailRequestDtoValidator : AbstractValidator<UpdateUserEmailRequestDto>
    {
        public UpdateUserEmailRequestDtoValidator()
        {
            RuleFor(x => x.Email).NotNull();
            RuleFor(x => x.Email).NotEmpty();
        }
    }
}
