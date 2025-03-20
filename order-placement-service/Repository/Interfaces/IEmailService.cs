


using order_placement_service.Model.NotificationFacade.Email;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IEmailService
    {
        Task<EmailResponseDto> SendEmail(EmailRequestDto request);
    }
}
