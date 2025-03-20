
using order.Store;
using order_placement_service.Model.CartFacade.ShoppingCart;
using order_placement_service.Model.CustomerFacade.Store;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IFavoriteStoreService
    {
        Task<FavoriteStoreResponseDto> SaveFavoriteStore(FavoriteStoreRequestDto favoriteStoreRequestDto);
        Task<FavoriteStoreResponseDto> GetFavoriteStores(FavoriteStoreRequestDto favoriteStoreRequestDto);
        Task<UpdateResultDto> DeleteFavoriteStore(DeleteFavoriteStoreRequestDto deleteFavoriteStoreRequestDto);
    }
}
