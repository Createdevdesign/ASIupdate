using Microsoft.Extensions.Options;
using order_placement_service.Entities.Stores;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Repository.Interfaces;
using System;

using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation.Framewrokservice
{
    public class StoreService : Interfaces.FrameworkService.IStoreService
    {
        #region Fields
        private readonly IRepository<Store> storeRepository;
        private readonly IOptions<AppSettings> appSettings;
        #endregion

        public StoreService(IRepository<Store> _storeRepository)
        {
            storeRepository = _storeRepository;
        }

        public StoreService(string mongoDBPath)
        {
            appSettings = Options.Create(new AppSettings());
            appSettings.Value.MongoDbConnectionString = mongoDBPath;
            storeRepository = new MongoDBRepository<Store>((MongoDB.Driver.IMongoDatabase)appSettings);
        }

        /// <summary>
        /// Returns the Store object from SwiftServe for the given StoreId
        /// </summary>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<Store> GetStoreAsync(string storeId)
        {
            return await storeRepository.GetByIdAsync(storeId);
        }

        /// <summary>
        /// Returns the Store object from SwiftServe for the given Clover merchant ID
        /// </summary>
        /// <param name="merchantId"></param>
        /// <returns></returns>
        public async Task<Store> GetStoreByCloverMerchantID(string merchantId)
        {
            return storeRepository.Table.Where(x => x.ThirdPartyConfig != null
                && x.ThirdPartyConfig.IntegrationChannel.Equals("Clover")
                && x.ThirdPartyConfig.MerchantId.Equals(merchantId)).FirstOrDefault();
        }

    }
}
