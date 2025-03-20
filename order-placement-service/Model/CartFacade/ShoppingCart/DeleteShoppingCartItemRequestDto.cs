
using System.Runtime.Serialization;

namespace order_placement_service.Model.CartFacade.ShoppingCart
{
    [DataContract]
    public class DeleteShoppingCartItemRequestDto : BaseDto
    {
        [DataMember]
        public string CartId { get; set; }
    }
}
