using order_placement_service.Common;
using order_placement_service.Entities.Products;
using order_placement_service.Model.CartFacade.ShoppingCart;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface ICartService
    {
        Task<CreateCartItemResponseDto> CreateCartItem(CreateCartItemRequestDto requestDto);
        Task<GetShoppingCartItemsResponseDto> GetShoppingCartItems(GetShoppingCartItemsRequestDto getCartItemRequest);
        Task<UpdateResultDto> UpdateShoppingCartItem(UpdateShoppingCartItemRequestDto requestDto);
        Task<UpdateResultDto> DeleteShoppingCartItem(DeleteShoppingCartItemRequestDto requestDto);

        Task<List<ProductAttributesDto>> ParseProductAttributesFromXml(string xmlToParse, Product product);
    }
}
