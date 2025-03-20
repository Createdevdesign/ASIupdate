using System;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Orders
{
    [DataContract]
    public class OrderItemDto
    {
        [DataMember]
        public string ProductId { get; set; }
        [DataMember]
        public string VendorId { get; set; }
        [DataMember]
        public int Quantity { get; set; }
        [DataMember]
        public decimal UnitPriceWithoutDiscInclTax { get; set; }
        [DataMember]
        public decimal UnitPriceWithoutDiscExclTax { get; set; }
        [DataMember]
        public decimal UnitPriceInclTax { get; set; }
        [DataMember]
        public decimal UnitPriceExclTax { get; set; }
        [DataMember]
        public decimal PriceInclTax { get; set; }
        [DataMember]
        public decimal PriceExclTax { get; set; }
        [DataMember]
        public decimal DiscountAmountInclTax { get; set; }
        [DataMember]
        public decimal DiscountAmountExclTax { get; set; }
        [DataMember]
        public string AttributeDescription { get; set; }
        [DataMember]
        public DateTime? RentalStartDateUtc { get; set; }
        [DataMember]
        public DateTime? RentalEndDateUtc { get; set; }
        [DataMember]
        public DateTime CreatedOnUtc { get; set; }
    }
}
