using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CartFacade.ShoppingCart
{
    [DataContract]
    public class GetShoppingCartItemsResponseDto
    {
        [DataMember]
        public List<ShoppingCartItemDto> ShoppingCartItems { get; set; }
        [DataMember]
        public decimal TotalCartPrice { get; set; }
        public int TotalItems
        {
            get { return ShoppingCartItems.Count; }
        }

        public GetShoppingCartItemsResponseDto()
        {
            ShoppingCartItems = new List<ShoppingCartItemDto>();
        }
    }
}
