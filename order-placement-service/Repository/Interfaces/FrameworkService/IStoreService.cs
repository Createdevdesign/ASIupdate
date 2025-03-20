
using order_placement_service.Entities.Stores;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces.FrameworkService
{
    public interface IStoreService
    {
        Task<Store> GetStoreAsync(string storeId);
        Task<Store> GetStoreByCloverMerchantID(string merchantId);
    }
}
