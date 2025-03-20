using System;
using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade.Order
{
    [DataContract]
    public class PlaceOrderRequestDto
    {
        [DataMember]
        public string? StoreId { get; set; }
        [DataMember]
        public string? CustomerId { get; set; }
        [DataMember]
        public string? PromoCode { get; set; }
        [DataMember]
        public string? PromotionId { get; set; }
        [DataMember]
        public string? ExtId { get; set; }
        [DataMember]
        public string? Token { get; set; }
        [DataMember]
        public decimal TipAmount { get; set; }
        [DataMember]
        public bool PayAtStore { get; set; }
        [DataMember]
        public string? OrderComment { get; set; }
        [DataMember]
        public string? SelectedTime { get; set; }
        [DataMember]
        public string? OrderType { get; set; }
        [DataMember]
        public string? AddressId { get; set; }
        [DataMember]
        public string? GeoLong { get; set; }
        [DataMember]
        public string? GeoLat { get; set; }
        [DataMember]
        public string? UserAgent { get; set; }
        [DataMember]
        public string? IpAddress { get; set; }
        [DataMember]
        public string? PaymentIntentId { get; set; }
        [DataMember]
        public string? PaymentMethodType { get; set; }
    }
}
