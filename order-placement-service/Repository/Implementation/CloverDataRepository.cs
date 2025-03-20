
using order_placement_service.Common;
using order_placement_service.Entities.Clover;
using order_placement_service.ExternalDataAccess;
using order_placement_service.ExternalDataAccess.Models;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation
{
    public class CloverDataRepository : IExternalDataRepository
    {
        MyHttpClientFactory httpClient;
        public CloverDataRepository()
        {
            httpClient = new MyHttpClientFactory(string.Empty);
        }

        public string SaveOrder(CloverOrderDto order, ExternalOrderRequestDto cloverOrder)
        {

            string cloverBaseUrl = order.credential.BaseUrl;
            string merchantId = order.credential.MerchantId;
            string accessToken = order.credential.AccessToken;
            var credentials = new Credential { BaseUrl = cloverBaseUrl, MerchantId = merchantId, AccessToken = accessToken };
            //Get Order Id
            string orderId = this.AddOrder(credentials, cloverOrder);
            foreach (var item in order.LineItems.Where(x=>x.LineItemId!=null))
            {
                for (int i = 0; i < item.Quantity; i++)
                {
                    //Add Line Item
                    var lineItemId = this.AddLineItem(item, orderId, credentials);
                    foreach (var modifier in item.Modifiers)
                    {
                        this.AddModifier(orderId, lineItemId, modifier.ModifierId, credentials);
                    }
                }
            }
            var result = this.AddLineItem(new LineItemDto { LineItemId = Guid.NewGuid().ToString() }, orderId, credentials, cloverOrder.lineItems);

            return orderId;
        }

        private string AddOrder(Credential credentials, ExternalOrderRequestDto cloverOrder)
        {
            try
            {
                string url = $"merchants/{credentials.MerchantId}/orders?access_token={credentials.AccessToken}";
                var res = httpClient.PostAsync<ExternalOrderRequestDto, ExternalOrderResponseDto>(new Uri(new Uri(credentials.BaseUrl), url).AbsoluteUri, cloverOrder).Result;

                return res.id;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public string AddLineItem(LineItemDto item, string orderId, Credential credentials, List<LineItems> lineItems = null)
        {
            string url = $"merchants/{credentials.MerchantId}/orders/{orderId}/line_items?access_token={credentials.AccessToken}";
            if (lineItems == null)
            {
                var data = new LineItemRequestDto { item = new Item { id = item.LineItemId }, note = item.Note };
                var res = httpClient.PostAsync<LineItemRequestDto, LineItemResponseDto>(new Uri(new Uri(credentials.BaseUrl), url).AbsoluteUri, data).Result;
                return res.id;
            }

            if (lineItems != null && lineItems.Count > 0)
            {
                foreach (var line in lineItems)
                {
                    if (line.price > 0)
                    {
                        var result = httpClient.PostAsync<LineItems, LineItemResponseDto>(new Uri(new Uri(credentials.BaseUrl), url).AbsoluteUri, line).Result;
                    }
                }
            }
            return "1";
        }

        public void AddModifier(string orderId, string lineItemId, string modifierId, Credential credential)
        {
            httpClient = new MyHttpClientFactory(credential.AccessToken);
            var data = new ModifierRequestDto();
            data.modifier.id = modifierId;
            string url = $"merchants/{credential.MerchantId}/orders/{orderId}/line_items/{lineItemId}/modifications";
            var res = httpClient.PostAsync<ModifierRequestDto, ModifierResponseDto>(new Uri(new Uri(credential.BaseUrl), url).AbsoluteUri, data).Result;
        }

        /// <summary>
        /// /// Get Products from 3rd Party Provider eg. Clover
        /// </summary>
        /// <param name="credentials"></param>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<List<ProductDto>> GetInventory(StoreDto store, List<ProductAttributesDto> productAttributes, List<CategoryDto> categories)
        {
            List<ProductDto> products = null;
            List<ProductAttributeMappingDto> attributeMapping = null;
            string url = $"merchants/{store.ThirdPartyConfig.MerchantId}/items?expand=categories,modifierGroups&access_token={store.ThirdPartyConfig.AccessToken}&return_null_fields=true&limit=999";
            var inventory = await httpClient.GetAsync<Inventory>(new Uri(new Uri(store.ThirdPartyConfig.BaseUrl), url).AbsoluteUri);

            if (inventory != null && inventory.Elements != null && inventory.Elements.Count > 0)
            {
                products = new List<ProductDto>();

                foreach (var item in inventory.Elements)
                {
                    var cloverCategoryId = item.Categories.Elements.Select(c => c.Id).FirstOrDefault();
                    var category = categories.Where(a => a.ExternalCategoryId.Equals(cloverCategoryId)).FirstOrDefault();

                    if (item.ModifierGroups != null)
                    {
                        attributeMapping = new List<ProductAttributeMappingDto>();
                        var cloverModifierIds = item.ModifierGroups.Elements.Select(b => b.Id).ToList();
                        var attribute = productAttributes.Where(a => cloverModifierIds.Contains(a.ExternalAttributeId)).ToList();

                        int displayOrder = 1;
                        attributeMapping = attribute != null ? (from attr in attribute
                                                                select new ProductAttributeMappingDto
                                                                {
                                                                    ProductAttributeId = attr.Id,
                                                                    DisplayOrder = displayOrder++,
                                                                    AttributeControlTypeId = 3,
                                                                    ProductAttributeValues = (from attrVal in attr.ProductAttributeValues
                                                                                              select new ProductAttributeValueDto
                                                                                              {
                                                                                                  Name = attrVal.Name,
                                                                                                  PriceAdjustment = attrVal.Cost.DivideNumber(100),
                                                                                                  Cost = attrVal.Cost.DivideNumber(100),
                                                                                                  DisplayOrder = attrVal.DisplayOrder,
                                                                                                  ExternalAttributeId = attrVal.ExternalAttributeId
                                                                                              }).ToList()
                                                                }).ToList() : null;
                    }

                    products.Add(new ProductDto
                    {
                        Name = item.Name,
                        ExternalId = item.Id,
                        Price = Convert.ToDecimal(item.Price).DivideNumber(100),
                        SeName = item.AlternateName,
                        LimitedToStores = true,
                        Stores = new List<string> { store.Id },
                        IsVisible = item.Hidden,
                        Enabled = !item.Hidden,
                        ProductCategories = cloverCategoryId != null ? new List<ProductCategoryDto>{ new ProductCategoryDto
                            {
                                CategoryId = category.Id,
                                IsFeaturedProduct = false,
                                DisplayOrder = category.DisplayOrder
                            } } : null,
                        ProductAttributeMappings = attributeMapping,
                        UpdatedOnUtc = !string.IsNullOrWhiteSpace(item.ModifiedTime) ? DateTimeOffset.FromUnixTimeMilliseconds(long.Parse(item.ModifiedTime)).UtcDateTime : DateTime.MinValue
                    }); ;
                }
            }
            return products;
        }

        /// <summary>
        /// Get Modifiers from Clover into SwiftServer ProductAttribute
        /// </summary>
        /// <param name="credentials"></param>
        /// <param name="storeId"></param>
        /// <returns></returns>
        public async Task<GetModifiersDto> GetModifiers(StoreDto store)
        {
            GetModifiersDto getModifiersDto = null;
            string modifierUrl = $"merchants/{store.ThirdPartyConfig.MerchantId}/modifiers?access_token={store.ThirdPartyConfig.AccessToken}&return_null_fields=true";
            string modifierGroupUrl = $"merchants/{store.ThirdPartyConfig.MerchantId}/modifier_groups?access_token={store.ThirdPartyConfig.AccessToken}&return_null_fields=true";
            var modifiers = await httpClient.GetAsync<Modifiers>(new Uri(new Uri(store.ThirdPartyConfig.BaseUrl), modifierUrl).AbsoluteUri);
            var modifierGroup = await httpClient.GetAsync<ModifierGroup>(new Uri(new Uri(store.ThirdPartyConfig.BaseUrl), modifierGroupUrl).AbsoluteUri);
            getModifiersDto = new GetModifiersDto { Modifiers = modifiers, ModifierGroup = modifierGroup };
            return getModifiersDto;
        }

        /// <summary>
        /// Get Clover Categories into SS Categories
        /// </summary>
        /// <param name="credentials"></param>
        /// <returns></returns>
        public async Task<List<CategoryDto>> GetCategories(StoreDto store)
        {
            List<CategoryDto> ssCategories = null;
            string categoryUrl = $"merchants/{store.ThirdPartyConfig.MerchantId}/categories?&access_token={store.ThirdPartyConfig.AccessToken}&return_null_fields=true";
            var categories = await httpClient.GetAsync<Categories>(new Uri(new Uri(store.ThirdPartyConfig.BaseUrl), categoryUrl).AbsoluteUri);

            if (categories.Elements.Count > 0 && categories != null && categories.Elements != null)
            {
                ssCategories = new List<CategoryDto>();
                foreach (var category in categories.Elements)
                {
                    ssCategories.Add(new CategoryDto
                    {
                        ExternalCategoryId = category.Id,
                        Name = category.Name,
                        SeName = category.Name,
                        DisplayOrder = category.SortOrder,
                        Stores = new List<string> { store.Id },
                        Flag = "New",
                        CreatedOnUtc = DateTime.UtcNow,
                        UpdatedOnUtc = DateTime.UtcNow //TODO - Add logic for modified time category.ModifiedTime
                    });
                }
            }

            return ssCategories;
        }

        /// <summary>
        /// Returns the Clover item in SS Product type object
        /// </summary>
        /// <param name="itemId"></param>
        /// <param name="store"></param>
        /// <param name="productAttributes"></param>
        /// <param name="categories"></param>
        /// <returns></returns>
        public async Task<ProductDto> GetInventoryItem(string itemId, StoreDto store, List<ProductAttributesDto> productAttributes, List<CategoryDto> categories)
        {
            ProductDto products = null;
            List<ProductAttributeMappingDto> attributeMapping = null;
            string url = $"merchants/{store.ThirdPartyConfig.MerchantId}/items/{itemId}?expand=categories,modifierGroups&access_token={store.ThirdPartyConfig.AccessToken}";
            //Single Clover item is returned in the Item type
            var inventoryItem = await httpClient.GetAsync<Items>(new Uri(new Uri(store.ThirdPartyConfig.BaseUrl), url).AbsoluteUri);

            if (inventoryItem != null)
            {
                var cloverCategoryId = inventoryItem.Categories.Elements.Select(c => c.Id).FirstOrDefault();
                var category = categories.Where(a => a.ExternalCategoryId.Equals(cloverCategoryId)).FirstOrDefault();

                if (inventoryItem.ModifierGroups != null)
                {
                    attributeMapping = new List<ProductAttributeMappingDto>();
                    var cloverModifierIds = inventoryItem.ModifierGroups.Elements.Select(b => b.Id).ToList();
                    var attribute = productAttributes.Where(a => cloverModifierIds.Contains(a.ExternalAttributeId)).ToList();
                    attributeMapping = attribute != null ? (from attr in attribute
                                                            select new ProductAttributeMappingDto
                                                            {
                                                                ProductAttributeId = attr.Id,
                                                                DisplayOrder = 1,
                                                                AttributeControlTypeId = 3,
                                                                ProductAttributeValues = (from attrVal in attr.ProductAttributeValues
                                                                                          select new ProductAttributeValueDto
                                                                                          {
                                                                                              Name = attrVal.Name,
                                                                                              PriceAdjustment = attrVal.Cost.DivideNumber(100),
                                                                                              Cost = attrVal.Cost.DivideNumber(100),
                                                                                              DisplayOrder = attrVal.DisplayOrder,
                                                                                              ExternalAttributeId = attrVal.ExternalAttributeId
                                                                                          }).ToList()
                                                            }).ToList() : null;
                }

                products = new ProductDto
                {
                    Name = inventoryItem.Name,
                    ExternalId = inventoryItem.Id,
                    Price = Convert.ToDecimal(inventoryItem.Price).DivideNumber(100),
                    SeName = inventoryItem.AlternateName,
                    LimitedToStores = true,
                    Stores = new List<string> { store.Id },
                    IsVisible = inventoryItem.Hidden,
                    Enabled = !inventoryItem.Hidden,
                    ProductCategories = cloverCategoryId != null ? new List<ProductCategoryDto>{ new ProductCategoryDto
                            {
                                CategoryId = category.Id,
                                IsFeaturedProduct = false,
                                DisplayOrder = category.DisplayOrder
                            } } : null,
                    ProductAttributeMappings = attributeMapping,
                    UpdatedOnUtc = !string.IsNullOrWhiteSpace(inventoryItem.ModifiedTime) ? DateTimeOffset.FromUnixTimeMilliseconds(long.Parse(inventoryItem.ModifiedTime)).UtcDateTime : DateTime.MinValue
                };
            }

            return products;
        }

        /// <summary>
        /// Get Clover Order by OrderID
        /// </summary>
        /// <param name="orderId"></param>
        /// <param name="store"></param>
        /// <returns></returns>
        public async Task<Order> GetOrder(string orderId, StoreDto store)
        {
            string url = $"merchants/{store.ThirdPartyConfig.MerchantId}/orders/{orderId}?access_token={store.ThirdPartyConfig.AccessToken}";
            var order = await httpClient.GetAsync<Order>(new Uri(new Uri(store.ThirdPartyConfig.BaseUrl), url).AbsoluteUri);

            return order;
        }
    }
}
