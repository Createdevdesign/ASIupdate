
using order_placement_service.Model;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface ISmsManager
    {
        Task<VerificationCodeResponseDto> SendVerificationCode(VerificationCodeRequestDto verificationCodeRequestDto);
        Task<VerifyPhoneNumberResponseDto> VerifyPhoneNumber(VerifyPhoneNumberRequestDto verifyPhoneNumberRequestDto);
    }
}
