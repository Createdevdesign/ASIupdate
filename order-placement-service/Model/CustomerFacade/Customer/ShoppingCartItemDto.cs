using System;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class ShoppingCartItemDto
    {
        [DataMember]
        public string? StoreId { get; set; }
        [DataMember]
        public string? WarehouseId { get; set; }
        [DataMember]
        public int ShoppingCartTypeId { get; set; }
        [DataMember]
        public string? ProductId { get; set; }
        [DataMember]
        public string? AttributesXml { get; set; }
        [DataMember]
        public string? CustomerEnteredPrice { get; set; }
        [DataMember]
        public int Quantity { get; set; }
        [DataMember]
        public DateTime RentalStartDateUtc { get; set; }
        [DataMember]
        public DateTime RentalEndDateUtc { get; set; }
        [DataMember]
        public DateTime CreatedOnUtc { get; set; }
        [DataMember]
        public DateTime UpdatedOnUtc { get; set; }
        [DataMember]
        public bool IsFreeShipping { get; set; }
        [DataMember]
        public bool IsGiftCard { get; set; }
        [DataMember]
        public bool IsShipEnabled { get; set; }
        [DataMember]
        public string? AdditionalShippingChargeProduct { get; set; }
        [DataMember]
        public bool IsTaxExempt { get; set; }
        [DataMember]
        public bool IsRecurring { get; set; }
        [DataMember]
        public string? ReservationId { get; set; }
        [DataMember]
        public string? Parameter { get; set; }
        [DataMember]
        public string? Duration { get; set; }
    }
}
