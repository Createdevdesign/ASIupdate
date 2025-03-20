using order_placement_service.Model.CustomerFacade.Customer;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces.CustomerService
{
    public interface ICustomerService
    {
        Task<UserProfileResponseDto> GetUserProfile(GetUserProfileRequestDto userProfileRequestDto);
        Task<Model.CustomerFacade.Customer.UpdateResultDto> UpdateUserProfile(UpdateUserProfileRequestDto updateUserProfileRequestDto);
        Task<SavePreferenceResponseDto> SaveMyPreference(SavePreferenceRequestDto savePreferenceRequestDto);
        Task<UserEmailResponseDto> GetUserEmail(GetUserEmailRequestDto userEmailRequestDto);
        Task<Model.CustomerFacade.Customer.UpdateResultDto> UpdateUserEmailDisplayName(UpdateUserEmailRequestDto updateUserEmailRequestDto);
        Task<StateProvinceDto> GetStateProvince();
    }
}
