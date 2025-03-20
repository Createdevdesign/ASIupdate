using AutoMapper;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using order_placement_service.Common;
using order_placement_service.Entities.Customers;
using order_placement_service.Entities.Products;
using order_placement_service.Model.CartFacade;
using order_placement_service.Model.CartFacade.ShoppingCart;
using order_placement_service.Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace order_placement_service.Repository.Implementation
{
    public class CartService : ICartService
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Entities.Products.ProductAttribute> _productAttributeRepository;
        private readonly IMapper _mapper;
        private readonly WebHelper _webHelper;

        public CartService()
        {
            _webHelper = new WebHelper();
        }

        public CartService(IRepository<Customer> customerRepository, IRepository<Product> productRepository, IRepository<Entities.Products.ProductAttribute> productAttributeRepository, IMapper mapper, WebHelper webHelper)
        {
            _customerRepository = customerRepository;
            _productRepository = productRepository;
            _productAttributeRepository = productAttributeRepository;
            _mapper = mapper;
            _webHelper = webHelper;
        }

        public async Task<CreateCartItemResponseDto> CreateCartItem(CreateCartItemRequestDto requestDto)
        {
            if (string.IsNullOrWhiteSpace(requestDto.UserName))
                return await Task.FromResult<CreateCartItemResponseDto>(null);

            Customer customer = await _customerRepository.Table.SingleOrDefaultAsync(c => c.Username == requestDto.UserName);
            ShoppingCartItem cartItem = new ShoppingCartItem
            {
                Duration = requestDto.Duration,
                Id = ObjectId.GenerateNewId().ToString(),
                Parameter = requestDto.Parameter,
                ProductId = requestDto.ProductId,
                Quantity = requestDto.Quantity,
                ReservationId = requestDto.ReservationId,
                ShoppingCartType = requestDto.ShoppingCartType,
                ShoppingCartTypeId = requestDto.ShoppingCartTypeId,
                StoreId = requestDto.StoreId,
                CreatedOnUtc = DateTime.UtcNow,
                UpdatedOnUtc = DateTime.UtcNow,
                AdditionalComments = requestDto.AdditionalComments,
                AttributesXml = (requestDto.Attributes == null) ? null : await _webHelper.Serialize<Attributes>(requestDto.Attributes),
                OrderType = requestDto.OrderType,
                DeliveryTime = requestDto.DeliveryTime
            };

            customer.ShoppingCartItems.Add(cartItem);
            customer = await _customerRepository.UpdateAsync(customer);
            CreateCartItemResponseDto responseDto = new CreateCartItemResponseDto { CartId = cartItem.Id };

            return responseDto;
        }



        public async Task<GetShoppingCartItemsResponseDto> GetShoppingCartItems(GetShoppingCartItemsRequestDto requestDto)
        {
            if (string.IsNullOrWhiteSpace(requestDto.UserName))
                return await Task.FromResult<GetShoppingCartItemsResponseDto>(null);

            Customer customer = await _customerRepository.Table.SingleOrDefaultAsync(a => a.Username == requestDto.UserName);
            List<ShoppingCartItem> shoppingCartItems = customer.ShoppingCartItems.Where(a => a.StoreId == requestDto.StoreId).ToList();
            var productIds = shoppingCartItems.Select(a => a.ProductId).Distinct().ToList();
            var product = await _productRepository.Table.Where(a => productIds.Contains(a.Id)).ToListAsync();
            List<ShoppingCartItemDto> shoppingCartItemsDto = new List<ShoppingCartItemDto>();

            if (product.Count > 0)
            {
                shoppingCartItemsDto = (from pd in product
                                        join sc in shoppingCartItems
                                        on pd.Id equals sc.ProductId
                                        select new ShoppingCartItemDto
                                        {
                                            Id = sc.Id,
                                            Name = pd.Name,
                                            Price = pd.Price,
                                            TotalProductPrice = pd.Price * sc.Quantity,
                                            Quantity = sc.Quantity,
                                            ShoppingCartType = sc.ShoppingCartType,
                                            ShoppingCartTypeId = sc.ShoppingCartTypeId,
                                            CreatedOnUtc = sc.CreatedOnUtc,
                                            Duration = sc.Duration,
                                            ProductId = pd.Id,
                                            StoreId = sc.StoreId,
                                            UpdatedOnUtc = sc.UpdatedOnUtc,
                                            AdditionalComments = sc.AdditionalComments,
                                            ProductAttributes = ParseProductAttributesFromXml(sc.AttributesXml, pd).Result,
                                            DeliveryTime = sc.DeliveryTime,
                                            OrderType = sc.OrderType
                                        }).ToList();
            }

            //get attributes price
            foreach (var cart in shoppingCartItemsDto)
            {
                if (cart.ProductAttributes != null)
                {
                    foreach (var item in cart.ProductAttributes)
                    {
                        cart.TotalProductPrice = cart.TotalProductPrice + (item.ProductAttributeValues.Sum(a => a.PriceAdjustment) * cart.Quantity);
                    }
                }
            }

            GetShoppingCartItemsResponseDto getShoppingCartItemsResponseDto = new GetShoppingCartItemsResponseDto
            {
                ShoppingCartItems = shoppingCartItemsDto,
                TotalCartPrice = shoppingCartItemsDto.Sum(a => a.TotalProductPrice)
            };

            return getShoppingCartItemsResponseDto;
        }

        public async Task<List<ProductAttributesDto>> ParseProductAttributesFromXml(string xmlToParse, Product product)
        {
            List<ProductAttributesDto> productAttributes = null;
            if (!string.IsNullOrWhiteSpace(xmlToParse))
            {
                productAttributes = new List<ProductAttributesDto>();
                var attributes = await _webHelper.Deserialize<Attributes>(xmlToParse);

                productAttributes = (from prodAttr in product.ProductAttributeMappings
                                     join attr in attributes.ProductAttribute
                                     on prodAttr.Id equals attr.ID
                                     join addAttr in await _productAttributeRepository.Table.ToListAsync()
                                     on prodAttr.ProductAttributeId equals addAttr.Id
                                     select new ProductAttributesDto
                                     {
                                         Id = attr.ID,
                                         ProductAttributeName = addAttr.Name,
                                         ProductAttributeValues = (from value in prodAttr.ProductAttributeValues
                                                                   join attrValue in attr.ProductAttributeValue
                                                                   on value.Id equals attrValue.Value
                                                                   select new ProductAttributeValueDto
                                                                   {
                                                                       Id = value.Id,
                                                                       Cost = value.Cost ?? 0,
                                                                       Name = value.Name,
                                                                       PriceAdjustment = value.PriceAdjustment ?? 0
                                                                   }).ToList()
                                     }).ToList();
            }

            return productAttributes;
        }

        public async Task<UpdateResultDto> UpdateShoppingCartItem(UpdateShoppingCartItemRequestDto requestDto)
        {
            if (string.IsNullOrWhiteSpace(requestDto.UserName))
                return await Task.FromResult<UpdateResultDto>(null);

            var filterDefinition = MongoDB.Driver.Builders<Customer>.Filter.ElemMatch(a => a.ShoppingCartItems, b => b.Id == requestDto.Id && b.StoreId == requestDto.StoreId && b.ProductId == requestDto.ProductId);

            //TODO - Modify this code for better approach
            if (requestDto.Attributes == null)
            {
                var updateDefinition = Builders<Customer>.Update
                .Set(x => x.ShoppingCartItems.ElementAt(-1).Quantity, requestDto.Quantity)
                .Set(x => x.ShoppingCartItems.ElementAt(-1).UpdatedOnUtc, DateTime.UtcNow)
                .Set(x => x.ShoppingCartItems.ElementAt(-1).AdditionalComments, requestDto.AdditionalComments)
                .Set(x => x.ShoppingCartItems.ElementAt(-1).OrderType, requestDto.OrderType)
                .Set(x => x.ShoppingCartItems.ElementAt(-1).DeliveryTime, requestDto.DeliveryTime);

                return _mapper.Map<UpdateResult, UpdateResultDto>(await _customerRepository.Collection.UpdateOneAsync(filterDefinition, updateDefinition));
            }
            else
            {
                var updateDefinition = Builders<Customer>.Update
               .Set(x => x.ShoppingCartItems.ElementAt(-1).Quantity, requestDto.Quantity)
               .Set(x => x.ShoppingCartItems.ElementAt(-1).UpdatedOnUtc, DateTime.UtcNow)
               .Set(x => x.ShoppingCartItems.ElementAt(-1).AdditionalComments, requestDto.AdditionalComments)
               .Set(x => x.ShoppingCartItems.ElementAt(-1).OrderType, requestDto.OrderType)
               .Set(x => x.ShoppingCartItems.ElementAt(-1).DeliveryTime, requestDto.DeliveryTime)
               .Set(x => x.ShoppingCartItems.ElementAt(-1).AttributesXml, await _webHelper.Serialize<Attributes>(requestDto.Attributes));

                return _mapper.Map<UpdateResult, UpdateResultDto>(await _customerRepository.Collection.UpdateOneAsync(filterDefinition, updateDefinition));
            }
        }

        public async Task<UpdateResultDto> DeleteShoppingCartItem(DeleteShoppingCartItemRequestDto requestDto)
        {
            if (string.IsNullOrWhiteSpace(requestDto.UserName))
                return await Task.FromResult<UpdateResultDto>(null);

            Customer customer = await _customerRepository.Table.SingleOrDefaultAsync(a => a.Username == requestDto.UserName);
            var cartItem = customer.ShoppingCartItems.Where(a => a.StoreId == requestDto.StoreId && a.Id == requestDto.CartId).FirstOrDefault();

            var filter = Builders<Customer>.Filter.Eq(x => x.Username, requestDto.UserName);
            var updateBuilder = Builders<Customer>.Update;
            var update = updateBuilder.Pull(a => a.ShoppingCartItems, cartItem);
            var result = await _customerRepository.Collection.UpdateOneAsync(filter, update);

            return _mapper.Map<UpdateResult, UpdateResultDto>(result);
        }

    }
}
