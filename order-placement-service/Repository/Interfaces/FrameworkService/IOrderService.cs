
using order_placement_service.Entities.Orders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces.FrameworkService
{
    public interface IOrderService
    {
        Task<Order> GetOrderByExternalId(string externalOrderId);
        Task<bool> Update(Order order);
    }
}
