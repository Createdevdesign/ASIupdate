using FluentValidation;
using order_placement_service.Model.CustomerFacade.Customer;


namespace order_placement_service.Model.CustomerFacade.Validators
{
    public class SavePreferenceRequestDtoValidator:AbstractValidator<SavePreferenceRequestDto>
    {
        public SavePreferenceRequestDtoValidator()
        {
            RuleFor(x => x.Notifications).NotNull();
        }
    }
}
