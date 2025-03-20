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
    public class ProductService : IProductService
    {
        #region Fields
        private readonly IRepository<Product> productRepository;
        private readonly IOptions<AppSettings> appSettings;
        #endregion

        public ProductService(IRepository<Product> _productRepository)
        {
            productRepository = _productRepository;
        }

        public ProductService(string mongoDBPath)
        {
            appSettings = Options.Create(new AppSettings());
            appSettings.Value.MongoDbConnectionString = mongoDBPath;
            productRepository = new MongoDBRepository<Product>((MongoDB.Driver.IMongoDatabase)appSettings);
        }

        /// <summary>
        /// Returns a list of products from SwiftServe for the given StoreId
        /// </summary>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<List<Product>> GetProducts(string storeId)
        {
            return productRepository.Table.Where(x => x.Stores.Contains(storeId)).ToList();
        }

        /// <summary>
        /// Returns a list of Product External Ids related to the StoreId
        /// </summary>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<List<string>> GetExternalId(string storeId)
        {
            return await Task.FromResult<List<string>>(productRepository.Table.Where(x => x.Stores.Contains(storeId) && x.ExternalId != null).Select(a => a.ExternalId).ToList());
        }

        /// <summary>
        /// Insert a list of products in SS Collection
        /// </summary>
        /// <param name="products"></param>
        /// <returns></returns>
        public async Task<bool> InsertAsync(List<Product> products)
        {
            var output = await productRepository.InsertAsync(products);
            return output != null ? true : false;
        }

        /// <summary>
        /// Update a list of products in SS Collection
        /// </summary>
        /// <param name="products"></param>
        /// <returns></returns>
        public async Task<bool> UpdateAsync(List<Product> products)
        {
            var output = await productRepository.UpdateAsync(products);
            return output != null ? true : false;
        }

        /// <summary>
        /// Delete all products related to the store
        /// </summary>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<bool> DeleteAsync(List<Product> products)
        {
            var output = await productRepository.DeleteAsync(products);
            return output != null ? true : false;
        }

        /// <summary>
        /// Returns a single product for the externalId
        /// </summary>
        /// <param name="externalId"></param>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<Product> GetProductWithEternalId(string externalId, string storeId)
        {
            return await Task.FromResult<Product>(productRepository.Table.Where(a => a.ExternalId.Equals(externalId) && a.Stores.Contains(storeId)).SingleOrDefault());
        }
    }
}
