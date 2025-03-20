
using order_placement_service.Entities.Products;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces.FrameworkService
{
    public interface IProductService
    {
        Task<List<Product>> GetProducts(string storeId);
        Task<List<string>> GetExternalId(string storeId);
        Task<bool> InsertAsync(List<Product> products);
        Task<bool> UpdateAsync(List<Product> products);
        Task<bool> DeleteAsync(List<Product> products);
        Task<Product> GetProductWithEternalId(string externalId, string storeId);
    }
}
