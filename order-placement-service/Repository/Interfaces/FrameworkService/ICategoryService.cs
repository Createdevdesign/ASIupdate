
using order_placement_service.Entities.Categories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces.FrameworkService
{
    public interface ICategoryService
    {
        Task<List<Category>> GetCategoriesAsync(string storeId);
        Task<List<string>> GetExternalCategoryId(string storeId);
        Task<bool> InsertAsync(List<Category> categories);
        Task<bool> UpdateAsync(List<Category> categories);
    }
}
