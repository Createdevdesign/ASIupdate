using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade.Order
{
    [DataContract]
    public class CalculateStoreTotalsResponseDto
    {
        [DataMember]
        public decimal TaxAmount { get; set; }
        [DataMember]
        public decimal TotalAmount { get; set; }
        [DataMember]
        public decimal PromoCodeAmount { get; set; }
        [DataMember]
        public string PromotionName { get; set; }
        [DataMember]
        public decimal SubTotalAmount { get; set; }
        [DataMember]
        public string PromoCodeMessage { get; set; }
        [DataMember]
        public bool Status { get; set; }
        [DataMember]
        public decimal DeliveryFees { get; set; }
        [DataMember]
        public string Message { get; set; }
        [DataMember]
        public List<ShoppingCartItemDto> CartItems { get; set; }

        public CalculateStoreTotalsResponseDto()
        {
            Status = true;
        }
    }
}
