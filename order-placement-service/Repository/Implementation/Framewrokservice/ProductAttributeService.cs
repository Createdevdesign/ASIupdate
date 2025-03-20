using Microsoft.Extensions.Options;
using order_placement_service.Entities.Products;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Repository.Interfaces.FrameworkService;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation.Framewrokservice
{
    public class ProductAttributeService : IProductAttributeService
    {
        #region Fields
        private readonly IRepository<ProductAttribute> productAttributeRepository;
        private readonly IOptions<AppSettings> appSettings;
        #endregion

        public ProductAttributeService(IRepository<ProductAttribute> _productAttributeRepository)
        {
            productAttributeRepository = _productAttributeRepository;
        }

        public ProductAttributeService(string mongoDBPath)
        {
            appSettings = Options.Create(new AppSettings());
            appSettings.Value.MongoDbConnectionString = mongoDBPath;
            productAttributeRepository = new MongoDBRepository<ProductAttribute>(appSettings);
        }

        /// <summary>
        /// Returns a list of ProductAttribute External Ids
        /// </summary>
        /// <param></param>
        /// <returns></returns>
        public async Task<List<string>> GetExternalAttributeId()
        {
            return await Task.FromResult<List<string>>(productAttributeRepository.Table.Where(x => x.ExternalAttributeId != null).Select(a => a.ExternalAttributeId).ToList());
        }

        /// <summary>
        /// Get a list of PredefinedProductAttributeValue synced from external Sources ex. Clover
        /// </summary>
        /// <returns></returns>
        public async Task<List<PredefinedProductAttributeValue>> GetPredefinedProductAttribute()
        {
            return productAttributeRepository.Table.Where(x => x.PredefinedProductAttributeValues != null).SelectMany(a => a.PredefinedProductAttributeValues).Where(b => b.ExternalAttributeId != null).ToList();
        }

        /// <summary>
        /// Insert the list of ProductAttributes in SS Collection
        /// </summary>
        /// <param name="productAttributes"></param>
        /// <returns></returns>
        public async Task<bool> InsertAsync(List<ProductAttribute> productAttributes)
        {
            var output = await productAttributeRepository.InsertAsync(productAttributes);
            return output != null ? true : false;
        }

        /// <summary>
        /// Update the list of ProductAttributes in SS Collection
        /// </summary>
        /// <param name="productAttributes"></param>
        /// <returns></returns>
        public async Task<bool> UpdateAsync(List<ProductAttribute> productAttributes)
        {
            var output = await productAttributeRepository.UpdateAsync(productAttributes);
            return output != null ? true : false;
        }

        /// <summary>
        /// Returns list of all ProductAttributes in SS Attributes where ExternalAttributeId is not blank
        /// </summary>
        /// <returns></returns>
        public async Task<List<ProductAttribute>> GetProductAttributesWithExternalId()
        {
            return productAttributeRepository.Table.Where(x => x.ExternalAttributeId != null).ToList();
        }

        public async Task<List<ProductAttribute>> GetProductAttributes()
        {
            return await Task.FromResult<List<ProductAttribute>>(productAttributeRepository.Table.ToList());
        }
    }
}
