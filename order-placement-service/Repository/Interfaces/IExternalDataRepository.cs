using order_placement_service.Common;
using order_placement_service.Entities.Clover;
using order_placement_service.ExternalDataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IExternalDataRepository
    {
        string SaveOrder(CloverOrderDto order,ExternalOrderRequestDto cloverOrder);
        Task<List<ProductDto>> GetInventory(StoreDto store, List<ProductAttributesDto> productAttributes, List<CategoryDto> categories);
        Task<GetModifiersDto> GetModifiers(StoreDto store);
        Task<List<CategoryDto>> GetCategories(StoreDto store);
        Task<ProductDto> GetInventoryItem(string itemId, StoreDto store, List<ProductAttributesDto> productAttributes, List<CategoryDto> categories);
        Task<Order> GetOrder(string orderId, StoreDto store);
    }
}
