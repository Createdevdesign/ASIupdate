

using order_placement_service.Common;
using order_placement_service.ExternalDataAccess.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface ICloverService
    {
        Task<List<ProductDto>> GetInventory(StoreDto store, List<ProductAttributesDto> productAttributes, List<CategoryDto> categories);
        Task<GetModifiersDto> GetModifiers(StoreDto store);
        Task<List<CategoryDto>> GetCategories(StoreDto store);
        Task<ProductDto> GetInventoryItem(string itemId, StoreDto store, List<ProductAttributesDto> productAttributes, List<CategoryDto> categories);
    }
}
