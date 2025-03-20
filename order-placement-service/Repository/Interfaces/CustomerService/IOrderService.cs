using Microsoft.AspNetCore.Http;
using order_placement_service.Model.CustomerFacade.Orders;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces.CustomerService
{
    public interface IOrderService
    {
        Task<GetOrderResponseDto> GetMyOrders(GetOrdersRequestDto getOrdersRequestDto, IQueryCollection queryParams);
    }
}
