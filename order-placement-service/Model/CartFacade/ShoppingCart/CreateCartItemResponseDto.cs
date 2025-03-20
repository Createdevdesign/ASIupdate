using System.Runtime.Serialization;

namespace order_placement_service.Model.CartFacade.ShoppingCart
{
    [DataContract]
    public class CreateCartItemResponseDto
    {
        [DataMember]
        public string CartId { get; set; }
    }
}
