
using order_placement_service.Model.NotificationFacade;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces.FrameworkService
{
    public interface INotificationService
    {
        Task<NotificationResponseDto> SendNotification(NotificationRequestDto request);
        Task<string> VerifyEmail(string token);
        //Task<bool> SendVerificationEmail(string userName);
    }
}
