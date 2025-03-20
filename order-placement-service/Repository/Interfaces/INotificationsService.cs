using order_placement_service.Model.CustomerFacade.Customer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface INotificationsService
    {
        Task<bool> SendVerificationEmail(UserProfileResponseDto userProfileResponse);
        Task<string> VerifyEmail(string token);
    }
}
