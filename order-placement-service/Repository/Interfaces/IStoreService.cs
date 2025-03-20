

using order_placement_service.Model.Store.Products;
using order_placement_service.Model.Store.Store;
using SwiftServe.OrderService.WebApi.Model.Store.Store;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IStoreService
    {
        Task<GetFilteredStoreResponseDto> SearchStores(string storename);
        Task<GetFilteredStoreResponseDto> GetDefaultStores();
        Task<StoreDto> GetStore(string storecode);
        Task<GetPromotionsResponseDto> GetPromotions(GetPromotionsRequestDto requestDto);
        Task<GetProductsResponseDto> GetProducts(GetProductsRequestDto requestDto);
        Task<GetProductDetailsResponseDto> GetProductDetails(GetProductDetailsRequestDto requestDto);
        Task<GetCategoriesResponseDto> GetCategories(GetCategoriesRequestDto requestDto);
        Task<GetProductPictureResponseDto> GetProductPicture(GetProductPictureRequestDto requestDto);
        Task<DeliveryPickUpScheduleDto> GetStoreTimings(string storecode, string timeZone);
    }
}
