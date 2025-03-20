using Microsoft.Extensions.Options;
using order_placement_service.Entities.Categories;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Repository.Interfaces.FrameworkService;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation.Framewrokservice
{
    public class CategoryService : ICategoryService
    {
        #region Fields
        private readonly IRepository<Category> categoryRepository;
        private readonly IOptions<AppSettings> appSettings;
        #endregion

        public CategoryService(IRepository<Category> _categoryRepository)
        {
            categoryRepository = _categoryRepository;
        }

        public CategoryService(string mongoDBPath)
        {
            appSettings = Options.Create(new AppSettings());
            appSettings.Value.MongoDbConnectionString = mongoDBPath;
            categoryRepository = new MongoDBRepository<Category>(appSettings);
        }

        /// <summary>
        /// Returns a list of Categories related to the StoreId
        /// </summary>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<List<Category>> GetCategoriesAsync(string storeId)
        {
            return await Task.FromResult<List<Category>>(categoryRepository.Table.Where(x => x.Stores.Contains(storeId)).ToList());
        }

        /// <summary>
        /// Returns a list of ExternalCategoryIds related to the StoreId
        /// </summary>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<List<string>> GetExternalCategoryId(string storeId)
        {
            return await Task.FromResult<List<string>>(categoryRepository.Table.Where(x => x.Stores.Contains(storeId) && x.ExternalCategoryId != null).Select(a => a.ExternalCategoryId).ToList());
        }

        /// <summary>
        /// Insert the list of categories into SS Category collection
        /// </summary>
        /// <param name="categories"></param>
        /// <returns></returns>
        public async Task<bool> InsertAsync(List<Category> categories)
        {
            var output = await categoryRepository.InsertAsync(categories);
            return output != null ? true : false;
        }

        /// <summary>
        /// Update the list of categories into SS Category collection
        /// </summary>
        /// <param name="categories"></param>
        /// <returns></returns>
        public async Task<bool> UpdateAsync(List<Category> categories)
        {
            var output = await categoryRepository.UpdateAsync(categories);
            return output != null ? true : false;
        }
    }
}
