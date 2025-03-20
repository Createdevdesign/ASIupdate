
using order_placement_service.Service.AuthService.PhoneValidation;
using order_placement_service.Service.AuthService.User;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IUserSession
    {
        Task<UserSessionDto> SaveUserSession(PhoneNumberVerificationRequestDto userToken);
        Task<UserSessionDto> ValidateRefreshToken(RefreshTokenRequestDto refreshTokenRequestDto);
        Task<bool> DeleteSession(order_placement_service.Service.AuthService.User.LogoutRequestDto logoutRequestDto);
        Task<List<SessionDto>> SaveCustomerSession(PhoneNumberVerificationRequestDto phoneVerificationRequestDto);
    }
}
