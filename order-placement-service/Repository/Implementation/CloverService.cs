using order_placement_service.Common;
using order_placement_service.ExternalDataAccess.Models;
using order_placement_service.Repository.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation
{
    public class CloverService : ICloverService
    {
        private readonly IExternalDataRepository externalDataRepository;

        public CloverService()
        {
            externalDataRepository = new CloverDataRepository();
        }

        /// <summary>
        /// Get Categories from Clover
        /// </summary>
        /// <param name="store"></param>
        /// <returns></returns>
        public async Task<List<CategoryDto>> GetCategories(StoreDto store)
        {
            return await externalDataRepository.GetCategories(store);
        }

        /// <summary>
        /// Get modifiers from Clover
        /// </summary>
        /// <param name="store"></param>
        /// <returns></returns>
        public async Task<GetModifiersDto> GetModifiers(StoreDto store)
        {
            return await externalDataRepository.GetModifiers(store);
        }

        /// <summary>
        /// Returns a list of Products from Clover Inventory
        /// </summary>
        /// <param name="store"></param>
        /// <returns></returns>
        public async Task<List<ProductDto>> GetInventory(StoreDto store, List<ProductAttributesDto> productAttributes, List<CategoryDto> categories)
        {
            return await externalDataRepository.GetInventory(store, productAttributes, categories);
        }

        /// <summary>
        /// Get a single item from Clover
        /// </summary>
        /// <param name="itemId"></param>
        /// <returns></returns>
        public async Task<ProductDto> GetInventoryItem(string itemId, StoreDto store, List<ProductAttributesDto> productAttributes, List<CategoryDto> categories)
        {
            return await externalDataRepository.GetInventoryItem(itemId, store, productAttributes, categories);
        }
    }
}
