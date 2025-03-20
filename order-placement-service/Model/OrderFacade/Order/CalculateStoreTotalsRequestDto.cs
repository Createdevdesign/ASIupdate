
using order_placement_service.Model.CartFacade.ShoppingCart;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade.Order
{
    [DataContract]
    public class CalculateStoreTotalsRequestDto : BaseDto
    {
        [DataMember]
        public string SelectedTime { get; set; }
        [DataMember]
        public string OrderType { get; set; }
        [DataMember]
        public string AddressId { get; set; }
        [DataMember]
        public string PromotionId { get; set; }
        [DataMember]
        public string PromoCode { get; set; }
        [DataMember]
        public bool IsTaxRequired { get; set; }
        [DataMember]
        public List<CreateCartItemRequestDto> Products { get; set; }
    }
}
