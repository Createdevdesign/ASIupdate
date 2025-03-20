
using order_placement_service.Model.CustomerFacade.Customer;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IFeedbackService
    {
        Task<SavefeedbackResponseDto> SaveFeedback(SaveFeedbackRequestDto requestDto);
    }
}
