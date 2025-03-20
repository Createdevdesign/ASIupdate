using order_placement_service.Entities.Payments;
using order_placement_service.Model.OrderFacade.Order;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IOrderService
    {
        Task<CalculateTotalsResponseDto> CalculateTotals(CalculateTotalsRequestDto requestDto, bool isOrderPlaced = false, List<ShoppingCartItemDto> cartProducts = null);
        Task<PlaceOrderResultDto> PlaceOrder(ProcessPaymentRequest processPaymentRequest);
        Task<CalculateStoreTotalsResponseDto> CalculateStoreTotals(CalculateStoreTotalsRequestDto requestDto);
        Task<PlaceOrderResultDto> PlaceStoreOrder(StoreOrderRequestDto requestDto);
    }
}
