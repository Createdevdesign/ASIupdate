using order_placement_service.Model.QICode;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IQICodeService
    {
        Task<CreateQICResponseDto> CreateQICode(CreateQICRequestDto requestDto);
        Task<ReadQICResponseDto> ReadQICode(ReadQICRequestDto requestDto);
    }
}
