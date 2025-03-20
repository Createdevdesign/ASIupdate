using FluentValidation;
using order_placement_service.Model.CustomerFacade.Customer;


namespace order_placement_service.Model.CustomerFacade.Validators
{
    public class SaveFeedbackRequestDtoValidator: AbstractValidator<SaveFeedbackRequestDto>
    {
        public SaveFeedbackRequestDtoValidator()
        {
            RuleFor(m => m.Feedback).NotEmpty();
        }
    }
}
