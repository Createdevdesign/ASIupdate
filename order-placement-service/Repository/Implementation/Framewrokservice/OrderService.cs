using order_placement_service.Entities.Orders;
using order_placement_service.Repository.Interfaces;
using System;

using System.Linq;
using System.Threading.Tasks;


namespace order_placement_service.Repository.Implementation.Framewrokservice
{
    public class OrderService : Interfaces.FrameworkService.IOrderService
    {
        #region Fields
        private readonly IRepository<Order> orderRepository;
        #endregion

        public OrderService(IRepository<Order> _orderRepository)
        {
            _orderRepository = orderRepository;
        }

        /// <summary>
        /// Get Order by ThirParty Order Id
        /// </summary>
        /// <param name="externalOrderId"></param>
        /// <returns></returns>
        public async Task<Order> GetOrderByExternalId(string externalOrderId)
        {
            return orderRepository.Table.Where(a => a.ExternalOrderId.Equals(externalOrderId)).FirstOrDefault();
        }

        /// <summary>
        /// Updates a single Order
        /// </summary>
        /// <param name="order"></param>
        /// <returns></returns>
        public async Task<bool> Update(Order order)
        {
            var output = await orderRepository.UpdateAsync(order);
            return output != null ? true : false;
        }
    }
}
