using AutoMapper;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Newtonsoft.Json;
using order_placement_service.Common;
using order_placement_service.Entities.Categories;
using order_placement_service.Entities.Customers;
using order_placement_service.Entities.Discounts;
using order_placement_service.Entities.Products;
using order_placement_service.Entities.Stores;
using order_placement_service.Enums;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Model.Store;
using order_placement_service.Model.Store.Products;
using order_placement_service.Model.Store.Store;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Settings;
using SwiftServe.OrderService.WebApi.Model.Store.Store;

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation
{
    public class StoreService : IStoreService
    {
        #region Fields
        private readonly IRepository<Store> _storeRepository;
        private readonly IRepository<Discount> _discountRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<Picture> _picturRepository;
        private readonly IRepository<ProductAttribute> _productAttributeRepository;
        private readonly IRepository<SpecificationAttribute> _specificationAttributeRepository;
        private readonly IRepository<SpecificationAttributeOption> _specificationAttributeOptionRepository;
        private readonly IRepository<DiscountUsageHistory> _discountHistoryRepository;
        private readonly IRepository<Setting> _settingRepository;
        private readonly IMapper _mapper;
        private readonly WebHelper _webHelper;
        private readonly AppSettings _appSettings;
        #endregion

        public StoreService(IRepository<Store> storeRepository,
                            IRepository<Discount> discountRepository,
                            IRepository<Product> productRepository,
                            IRepository<DiscountUsageHistory> discountHistoryRepository,
                            IRepository<Customer> customerRepository,
                            IRepository<Category> categoryRepository,
                            IRepository<Picture> pictureRepository,
                            IRepository<SpecificationAttribute> specificationAttributeRepository,
                            IRepository<ProductAttribute> productAttributeRepository,
                            IRepository<SpecificationAttributeOption> specificationAttributeOptionRepository,
                            IRepository<Setting> settingRepository,
                            IMapper mapper,
                            WebHelper webHelper,
                            IOptions<AppSettings> appSettings)
        {
            _storeRepository = storeRepository;
            _discountRepository = discountRepository;
            _productRepository = productRepository;
            _discountHistoryRepository = discountHistoryRepository;
            _customerRepository = customerRepository;
            _categoryRepository = categoryRepository;
            _specificationAttributeRepository = specificationAttributeRepository;
            _picturRepository = pictureRepository;
            _specificationAttributeOptionRepository = specificationAttributeOptionRepository;
            _productAttributeRepository = productAttributeRepository;
            _settingRepository = settingRepository;
            _mapper = mapper;
            _webHelper = webHelper;
            _appSettings = appSettings.Value;
        }

        public async Task<GetFilteredStoreResponseDto> SearchStores(string storename)
        {
            List<Store> stores = await _storeRepository.Collection.Find(x => x.Name.ToLower().Contains(storename.Trim().ToLower())).ToListAsync();
            GetFilteredStoreResponseDto response = new GetFilteredStoreResponseDto();
            response.Stores = (from store in stores
                               select new StoreDto
                               {
                                   CompanyAddress = store.CompanyAddress,
                                   CompanyEmail = store.CompanyEmail,
                                   CompanyHours = $"{store.CompanyHours}",
                                   CompanyName = store.CompanyName,
                                   CompanyPhoneNumber = store.CompanyPhoneNumber,
                                   Id = store.Id,
                                   IsDefault = store.IsDefault,
                                   LogoUrl = GetLogoUrl(store).Result,
                                   Name = store.Name,
                                   //IsOpen = _webHelper.IsStoreOpen(store.CompanyHours),
                                   AdditioanlPaymentOptions = new AdditioanlPaymentOptionsDto { PaymentOptions = store.AdditionalPaymentOptions.PaymentOptions },
                                   PayAtStore = store.PayAtStore,
                                   Configuration = new ConfigurationDto
                                   {
                                       IsDelivery = store.Configuration.IsDelivery,
                                       IsPickUp = store.Configuration.IsPickUp
                                   }
                               }).ToList();


            return response;
        }



        private async Task<string> GetLogoUrl(Store store)
        {
            string name = null;
            var settingValue = await _settingRepository.Table.Where(x => x.StoreId.Equals(store.Id) && x.Name.Equals("storeinformationsettings.logopictureid") && x.Value != null).Select(a => a.Value).FirstOrDefaultAsync();

            if (!string.IsNullOrWhiteSpace(settingValue))
                name = (from pr in _picturRepository.Table.Where(a => a.Id.Equals(settingValue))
                        select new { Filename = pr.Id + "_" + "100" + "." + pr.MimeType }).FirstOrDefault().Filename;

            return (string.IsNullOrWhiteSpace(name)) ? string.Empty : _appSettings.AWSBucketForImages + name.Replace("image/", string.Empty);
        }

        public async Task<GetFilteredStoreResponseDto> GetDefaultStores()
        {
            List<Store> stores = await _storeRepository.Collection.Find(x => x.IsDefault).ToListAsync();
            //var defaultStores = _mapper.Map<List<Store>, GetFilteredStoreResponseDto>(stores.OrderBy(a => a.DisplayOrder).ToList());
            GetFilteredStoreResponseDto response = new GetFilteredStoreResponseDto();

            response.Stores = (from store in stores
                               select new StoreDto
                               {
                                   CompanyAddress = store.CompanyAddress,
                                   CompanyEmail = store.CompanyEmail,
                                   CompanyHours = store.CompanyHours,
                                   CompanyName = store.CompanyName,
                                   CompanyPhoneNumber = store.CompanyPhoneNumber,
                                   Id = store.Id,
                                   IsDefault = store.IsDefault,
                                   LogoUrl = GetLogoUrl(store).Result,
                                   Name = store.Name,
                                   //IsOpen = _webHelper.IsStoreOpen(store.CompanyHours),
                                   AdditioanlPaymentOptions = new AdditioanlPaymentOptionsDto { PaymentOptions = store.AdditionalPaymentOptions.PaymentOptions },
                                   PayAtStore = store.PayAtStore,
                                   Configuration = new ConfigurationDto
                                   {
                                       IsDelivery = store.Configuration.IsDelivery,
                                       IsPickUp = store.Configuration.IsPickUp
                                   }
                               }).ToList();

            return response;
        }

        public async Task<StoreDto> GetStore(string storecode)
        {
            Store store = await _storeRepository.Collection.Find(x => x.Id == storecode).FirstOrDefaultAsync();
            StoreDto response = null;
            if (store != null)
            {
                response = new StoreDto
                {
                    CompanyAddress = store.CompanyAddress,
                    CompanyEmail = store.CompanyEmail,
                    CompanyHours = store.CompanyHours,
                    CompanyName = store.CompanyName,
                    CompanyPhoneNumber = store.CompanyPhoneNumber,
                    Id = store.Id,
                    IsDefault = store.IsDefault,
                    LogoUrl = GetLogoUrl(store).Result,
                    Name = store.Name,
                    //IsOpen = _webHelper.IsStoreOpen(store.CompanyHours),
                    AdditioanlPaymentOptions = new AdditioanlPaymentOptionsDto { PaymentOptions = store.AdditionalPaymentOptions.PaymentOptions },
                    PayAtStore = store.PayAtStore,
                    Configuration = new ConfigurationDto
                    {
                        IsDelivery = store.Configuration.IsDelivery,
                        IsPickUp = store.Configuration.IsPickUp
                    }
                };
            }
            return response;
        }

        public async Task<GetPromotionsResponseDto> GetPromotions(GetPromotionsRequestDto requestDto)
        {
            if (string.IsNullOrEmpty(requestDto.Username))
                return await Task.FromResult<GetPromotionsResponseDto>(null);

            Customer customer = await _customerRepository.Table.Where(a => a.Username == requestDto.Username).SingleOrDefaultAsync();
            var discountHistory = await _discountHistoryRepository.Table.Where(h => h.CustomerId == customer.Id).ToListAsync();
            List<Discount> discounts = _discountRepository.Table.Where(a => a.Stores.Contains(requestDto.StoreId)).ToList();

            var discountDtos = _mapper.Map<IList<Discount>, IList<DiscountDto>>(discounts);
            GetPromotionsResponseDto responseDto = new GetPromotionsResponseDto { Discounts = discountDtos.ToList() };

            responseDto.Discounts = responseDto.Discounts.Where(a => a.IsEnabled && a.StartDateUtc <= DateTime.UtcNow && a.EndDateUtc >= DateTime.UtcNow).ToList();
            List<DiscountDto> discountToRemove = new List<DiscountDto>();

            //Check if the user has exhausted the limit of the discount can be used for each
            foreach (var discount in responseDto.Discounts.Where(a => a.LimitationTimes > 0))
            {
                if (discountHistory.Where(a => a.DiscountId == discount.Id).Count() >= discount.LimitationTimes)
                    discountToRemove.Add(discount);
            }

            responseDto.Discounts = responseDto.Discounts.Except(discountToRemove).ToList();

            return responseDto;
        }

        public async Task<GetProductsResponseDto> GetProducts(GetProductsRequestDto requestDto)
        {
            var products = await _productRepository.Collection.Find(x => x.Stores.Contains(requestDto.StoreId)).ToListAsync();

            if (products == null)
                return await Task.FromResult<GetProductsResponseDto>(null);

            var productsDto = (from product in products
                               select new ProductDto
                               {
                                   FullDescription = product.FullDescription,
                                   Id = product.Id,
                                   Name = product.Name,
                                   Price = product.Price,
                                   ProductCategories = new List<ProductCategoryDto> { new ProductCategoryDto { CategoryId = product.ProductCategories.Select(a => a.CategoryId).FirstOrDefault() } },
                                   ProductTypeId = product.ProductTypeId,
                                   ShortDescription = product.ShortDescription,
                                   PictureUrl = GetPictureUrl(product.ProductPictures)
                               }).ToList();

            GetProductsResponseDto getProductsResponseDto = new GetProductsResponseDto { Products = productsDto };

            return getProductsResponseDto;
        }

        private string GetPictureUrl(ICollection<ProductPicture> productPictures)
        {
            string name = string.Empty;
            var pictureIds = productPictures.Select(a => a.PictureId).ToList();
            if (pictureIds.Count > 0)
                name = (from pr in _picturRepository.Table.Where(a => pictureIds.Contains(a.Id))
                        select new { Filename = pr.Id + "_" + pr.SeoFilename + "." + pr.MimeType }).FirstOrDefault().Filename;

            return (string.IsNullOrWhiteSpace(name)) ? string.Empty : _appSettings.AWSBucketForImages + name.Replace("image/", string.Empty);
        }

        public async Task<GetProductDetailsResponseDto> GetProductDetails(GetProductDetailsRequestDto requestDto)
        {
            var product = await _productRepository.Collection.Find(x => x.Stores.Contains(requestDto.StoreId) && x.Id.Equals(requestDto.ProductId)).SingleOrDefaultAsync();

            if (product == null)
                return await Task.FromResult<GetProductDetailsResponseDto>(null);

            var result = _mapper.Map<Product, ProductDto>(product);
            GetProductDetailsResponseDto getProductsResponseDto = new GetProductDetailsResponseDto { Product = result };

            getProductsResponseDto.Product.PictureUrl = GetPictureUrl(product.ProductPictures);
            //Product Attributes
            getProductsResponseDto.Product.ProductAttributes = (from attMap in product.ProductAttributeMappings
                                                                join addAttr in await _productAttributeRepository.Table.ToListAsync()
                                                                on attMap.ProductAttributeId equals addAttr.Id
                                                                orderby attMap.DisplayOrder ascending
                                                                select new ProductAttributesDto
                                                                {
                                                                    Id = attMap.Id,
                                                                    ProductAttributeId = addAttr.Id,
                                                                    ProductAttributeName = addAttr.Name,
                                                                    DisplayOrder = attMap.DisplayOrder,
                                                                    IsRequired = attMap.IsRequired,
                                                                    AttributeControlType = Enum.GetName(typeof(AttributeControlType), attMap.AttributeControlType),
                                                                    ProductAttributeValues = (from x in attMap.ProductAttributeValues
                                                                                              orderby x.DisplayOrder ascending
                                                                                              select new ProductAttributeValueDto
                                                                                              {
                                                                                                  Id = x.Id,
                                                                                                  Cost = x.Cost ?? 0,
                                                                                                  Name = x.Name,
                                                                                                  PriceAdjustment = x.PriceAdjustment ?? 0,
                                                                                                  DisplayOrder = x.DisplayOrder,
                                                                                                  IsPreSelected = x.IsPreSelected
                                                                                              }).ToList()
                                                                }).ToList();

            //Product Specification Attributes
            getProductsResponseDto.Product.ProductSpecificationAttributes = (from spec in product.ProductSpecificationAttributes
                                                                             join specValues in await _specificationAttributeRepository.Table.ToListAsync()
                                                                             on spec.SpecificationAttributeId equals specValues.Id
                                                                             select new ProductSpecificationDto
                                                                             {
                                                                                 Id = spec.Id,
                                                                                 AttributeName = specValues.Name,
                                                                                 DisplayOrder = spec.DisplayOrder,
                                                                                 AttributeType = Enum.GetName(typeof(SpecificationAttributeType), spec.AttributeType),
                                                                                 AttributeValues = (from option in specValues.SpecificationAttributeOptions
                                                                                                    select new SpecificationAttributeOptionDto
                                                                                                    {
                                                                                                        Id = option.Id,
                                                                                                        Name = option.Name,
                                                                                                        DisplayOrder = option.DisplayOrder
                                                                                                    }).ToList()
                                                                             }).ToList();

            return getProductsResponseDto;
        }

        public async Task<GetCategoriesResponseDto> GetCategories(GetCategoriesRequestDto requestDto)
        {
            var categories = await _categoryRepository.Collection.Find(x => x.Stores.Contains(requestDto.StoreId)).ToListAsync();

            if (categories == null)
                return await Task.FromResult<GetCategoriesResponseDto>(null);

            var result = _mapper.Map<List<Category>, List<CategoryDto>>(categories).ToList();
            GetCategoriesResponseDto responseDto = new GetCategoriesResponseDto { Categories = result };
            return responseDto;
        }

        public async Task<GetProductPictureResponseDto> GetProductPicture(GetProductPictureRequestDto requestDto)
        {
            var pictures = await _picturRepository.Table.Where(x => x.Id.Equals(requestDto.PictureId)).ToListAsync();

            if (pictures == null)
                return await Task.FromResult<GetProductPictureResponseDto>(null);

            var result = _mapper.Map<List<Picture>, List<PictureDto>>(pictures).ToList();
            GetProductPictureResponseDto responseDto = new GetProductPictureResponseDto { Pictures = result };

            for (int i = 0; i < responseDto.Pictures.Count; i++)
            {
                responseDto.Pictures[i].PictureUrl = await _webHelper.GetPictureUrl(pictures[0]);
            }

            return responseDto;
        }

        public async Task<DeliveryPickUpScheduleDto> GetStoreTimings(string storecode, string timeZone)
        {
            Store store = await _storeRepository.Collection.Find(x => x.Id == storecode).FirstOrDefaultAsync();
            DeliveryPickUpScheduleDto schedule = new DeliveryPickUpScheduleDto();
            if (store != null)
            {
                StoreTimingDto storeTimingDto = JsonConvert.DeserializeObject<StoreTimingDto>(store.CompanyHours);

                int timeInterval = (store.Configuration != null) ? store.Configuration.DeliveryTimeInterval : 0;

                bool skipToday = false;
                if (storeTimingDto.ClosedDays.Any(a => a.Date.Equals(DateTime.UtcNow.Date)))
                    skipToday = true;

                if (timeInterval > 0)
                {
                    if (store.Configuration.IsDelivery)
                    {
                        for (int i = 0; i < store.Configuration.DeliveryCalendarDays; i++)
                        {
                            if (i == 0 && skipToday)
                                continue;

                            DateTime startDate = DateTime.UtcNow.AddDays(i);

                            string start = storeTimingDto.Delivery.Where(a => a.Day == startDate.DayOfWeek).Select(b => b.StartTime).FirstOrDefault();
                            string end = storeTimingDto.Delivery.Where(a => a.Day == startDate.DayOfWeek).Select(b => b.Endtime).FirstOrDefault();

                            if (!string.IsNullOrWhiteSpace(start) && !string.IsNullOrWhiteSpace(end))
                            {
                                DateTime startTime = DateTime.ParseExact(start, "HH:mm", CultureInfo.GetCultureInfo("en-US"));
                                DateTime endTime = DateTime.ParseExact(end, "HH:mm", CultureInfo.GetCultureInfo("en-US"));

                                List<string> timeSlots = new List<string>();
                                timeSlots.Add(startTime.ToString("h:mmtt"));
                                do
                                {

                                    if (startTime == DateTime.Now && startDate.DayOfWeek == DateTime.Now.DayOfWeek)
                                    {
                                        startTime = DateTime.Now;
                                        timeSlots.Add(startTime.AddMinutes(store.Configuration.DeliveryTimeInterval).ToString("h:mmtt"));
                                        startTime = startTime.AddMinutes(store.Configuration.DeliveryTimeInterval);
                                    }
                                    else
                                    {
                                        timeSlots.Add(startTime.AddMinutes(store.Configuration.DeliveryTimeInterval).ToString("h:mmtt"));
                                        startTime = startTime.AddMinutes(store.Configuration.DeliveryTimeInterval);
                                    }
                                }
                                while (startTime < endTime);

                                schedule.DeliverySchedules.Add(new DeliveryPickUpSchedule
                                {
                                    Date = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(startDate.Month) + " " + startDate.Day,
                                    Time = timeSlots
                                });
                            }
                        }
                    }
                    if (store.Configuration.IsPickUp)
                    {
                        for (int i = 0; i < store.Configuration.PickupCalendarDays; i++)
                        {
                            if (i == 0 && skipToday)
                                continue;

                            DateTime startDate = DateTime.UtcNow.AddDays(i);

                            string start = storeTimingDto.Open.Where(a => a.Day == startDate.DayOfWeek).Select(b => b.StartTime).FirstOrDefault();
                            string end = storeTimingDto.Open.Where(a => a.Day == startDate.DayOfWeek).Select(b => b.Endtime).FirstOrDefault();
                            if (!string.IsNullOrWhiteSpace(start) && !string.IsNullOrWhiteSpace(end))
                            {
                                DateTime startTime = DateTime.ParseExact(start, "HH:mm", CultureInfo.GetCultureInfo("en-US"));
                                DateTime endTime = DateTime.ParseExact(end, "HH:mm", CultureInfo.GetCultureInfo("en-US"));

                                List<string> timeSlots = new List<string>();
                                timeSlots.Add(startTime.ToString("h:mmtt"));
                                do
                                {
                                    timeSlots.Add(startTime.AddMinutes(store.Configuration.PickupTimeInterval).ToString("h:mmtt"));
                                    startTime = startTime.AddMinutes(store.Configuration.PickupTimeInterval);
                                }
                                while (startTime < endTime);

                                schedule.PickUpSchedules.Add(new DeliveryPickUpSchedule
                                {
                                    Date = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(startDate.Month) + " " + startDate.Day,
                                    Time = timeSlots
                                });
                            }
                        }
                    }
                }
            }
            return schedule;
        }
    }
}
