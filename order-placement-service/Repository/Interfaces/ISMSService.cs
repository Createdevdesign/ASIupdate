

using order_placement_service.Model.NotificationFacade.Sms;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface ISMSService
    {
        Task<SMSResponseDto> SendSMS(SMSRequestDto request);
    }
}
