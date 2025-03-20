using AutoMapper;
using order_placement_service.Entities.Common;
using order_placement_service.Entities.Customers;
using order_placement_service.Entities.Discounts;
using order_placement_service.Entities.Orders;
using order_placement_service.Entities.Payments;
using order_placement_service.Entities.Products;
using order_placement_service.Entities.Stores;
using order_placement_service.Model.CustomerFacade.Customer;
using order_placement_service.Model.CustomerFacade.Orders;
using order_placement_service.Model.CustomerFacade.Store;
using order_placement_service.Model.OrderFacade.Order;
using order_placement_service.Repository.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Configurations
{
    public class OrderServiceMapperConfiguration : Profile
    {
        private readonly IRepository<Product> _productRepository;
        public OrderServiceMapperConfiguration(IRepository<Product> productRepository)
        {
            _productRepository = productRepository;
        }
        public OrderServiceMapperConfiguration()
        {
            CreateMap<Discount, DiscountDto>();
            CreateMap<ShoppingCartItem, order_placement_service.Model.CartFacade.ShoppingCart.ShoppingCartItemDto>();
            CreateMap<List<ShoppingCartItem>, List<order_placement_service.Model.CartFacade.ShoppingCart.ShoppingCartItemDto>>();
            CreateMap<PlaceOrderRequestDto, ProcessPaymentRequest>();
            CreateMap<ProcessPaymentRequest, PlaceOrderRequestDto>();
            CreateMap<Store, StoreDto>();
            CreateMap<Address, AddressDto>();
            CreateMap<AddressDto, Address>();
            CreateMap<Address, Common.AddressDto>();
            CreateMap<Common.AddressDto, Address>();
            CreateMap<Address, AddressDto>();
            CreateMap<AddressDto, Address>();
            CreateMap<Notification, NotificationDto>();
            CreateMap<Customer, UserProfileResponseDto>().ForMember(a => a.CustomerId, map => map.MapFrom(b => b.Id));
            CreateMap<OrderItem, OrderItemDto>();
            CreateMap<OrderItem, OrderItemDto>();
            CreateMap<Order, Model.CustomerFacade.Orders.OrderDto>();
            CreateMap<PlaceOrderResult, PlaceOrderResultDto>();
            CreateMap<StoreOrderRequestDto, ProcessPaymentRequest>();
            CreateMap<ProcessPaymentRequest, StoreOrderRequestDto>();
            CreateMap<CalculateStoreTotalsResponseDto, CalculateTotalsResponseDto>();
            CreateMap<CalculateTotalsResponseDto, CalculateStoreTotalsResponseDto>();
              CreateMap<Model.OrderFacade.Order.OrderDto, Order>();
              CreateMap<Order, Model.OrderFacade.Order.OrderDto>();
        }
    }
}
