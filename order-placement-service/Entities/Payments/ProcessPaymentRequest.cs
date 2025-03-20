using System;

namespace order_placement_service.Entities.Payments
{
    public partial class ProcessPaymentRequest
    {
        public string? ExtId { get; set; }
        public string? UserName { get; set; }
        public string? OrderCode { get; set; }
        public string? StoreId { get; set; }
        public string? CustomerId { get; set; }
        public string? Token { get; set; }
        public Guid OrderGuid { get; set; }
        public decimal OrderTotal { get; set; }
        public decimal TipAmount { get; set; }
        public string? PromoCode { get; set; }
        public string? PromotionId { get; set; }
        public bool PayAtStore { get; set; }
        public string? OrderComment { get; set; }
        public string? SelectedTime { get; set; }
        public string? OrderType { get; set; }
        public string? AddressId { get; set; }
        public string? GeoLong { get; set; }
        public string? GeoLat { get; set; }
        public string? UserAgent { get; set; }
        public string? IpAddress { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PaymentIntentId { get; set; }
        public string? PaymentMethodType { get; set; }
    }
}
