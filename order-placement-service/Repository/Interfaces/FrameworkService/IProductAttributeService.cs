using order_placement_service.Entities.Products;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces.FrameworkService
{
    public interface IProductAttributeService
    {
        Task<List<string>> GetExternalAttributeId();
        Task<List<PredefinedProductAttributeValue>> GetPredefinedProductAttribute();
        Task<bool> InsertAsync(List<ProductAttribute> productAttributes);
        Task<bool> UpdateAsync(List<ProductAttribute> productAttributes);
        Task<List<ProductAttribute>> GetProductAttributesWithExternalId();
        Task<List<ProductAttribute>> GetProductAttributes();
    }
}
