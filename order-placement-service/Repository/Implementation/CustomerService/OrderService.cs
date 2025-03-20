using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using order_placement_service.Entities.Customers;
using order_placement_service.Entities.Orders;
using order_placement_service.Enums;
using order_placement_service.Model.CustomerFacade.Orders;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Repository.Interfaces.CustomerService;

namespace order_placement_service.Repository.Implementation.CustomerService
{
    public class OrderService : Interfaces.CustomerService.IOrderService
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IMapper _mapper;

        public OrderService(IRepository<Order> orderRepository, IRepository<Customer> customerRepository, IMapper mapper)
        {
            _orderRepository = orderRepository;
            _customerRepository = customerRepository;
            _mapper = mapper;
        }

        public async Task<GetOrderResponseDto> GetMyOrders(GetOrdersRequestDto getOrdersRequestDto, IQueryCollection queryParams)
        {
            int pageNumber = Convert.ToInt32(queryParams["pagenumber"]);
            int size = Convert.ToInt32(queryParams["size"]);
            string sortByOrderId = queryParams["sortbyorderid"].ToString();
            string sortByOrderPlacedDate = queryParams["sortbyorderplaceddate"];
            DateTime filterByOrderPlacedDate = Convert.ToDateTime(queryParams["filterbyorderplaceddate"]);
            OrderStatus filterByOrderStatus;
            var filterOrderStatus = Enum.TryParse(queryParams["filterbyorderstatus"], true, out filterByOrderStatus);
            int filterByOrderNumber = Convert.ToInt32(queryParams["filterbyordernumber"]);

            if (string.IsNullOrWhiteSpace(getOrdersRequestDto.Username))
                return await Task.FromResult<GetOrderResponseDto>(null);

            Customer customer = await _customerRepository.Table.SingleOrDefaultAsync(c => c.Username == getOrdersRequestDto.Username);
            List<Order> orders = await _orderRepository.Table.Where(x => x.CustomerId == customer.Id).ToListAsync();

            if (pageNumber > 0 && size > 0)
            {
                var canPage = (size * (pageNumber - 1)) < orders.Count;
                orders = (canPage) ? orders.Skip(size * (pageNumber - 1)).Take(size).ToList() : orders;
            }

            orders = (size > 0) ? orders.Take(size).ToList() : orders;
            orders = (!string.IsNullOrWhiteSpace(sortByOrderId)) ? orders.OrderBy(a => a.OrderNumber).ToList() : orders;
            orders = (!string.IsNullOrWhiteSpace(sortByOrderPlacedDate)) ? orders.OrderBy(a => a.CreatedOnUtc).ToList() : orders;
            orders = (filterByOrderPlacedDate != DateTime.MinValue) ? orders.Where(a => a.CreatedOnUtc == filterByOrderPlacedDate.ToUniversalTime()).ToList() : orders;
            orders = (filterByOrderStatus != 0) ? orders.Where(a => a.OrderStatus == filterByOrderStatus).ToList() : orders;
            orders = (filterByOrderNumber != 0) ? orders.Where(a => a.OrderNumber == filterByOrderNumber).ToList() : orders;
            orders = (queryParams.Count == 0) ? orders.Where(a => a.CreatedOnUtc.Month > DateTime.Now.AddMonths(-3).Month).ToList() : orders;

            var result = _mapper.Map<IList<Order>, IList<Model.CustomerFacade.Orders.OrderDto>>(orders);
            GetOrderResponseDto getOrderResponseDto = new GetOrderResponseDto { Orders = result.ToList() };
            return getOrderResponseDto;
        }
    }
}
