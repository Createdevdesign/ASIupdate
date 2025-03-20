

using order_placement_service.Common;

using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Orders
{
    [DataContract]
    public class OrderDto
    {
        [DataMember]
        public int OrderNumber { get; set; }
        [DataMember]
        public string StoreId { get; set; }
        [DataMember]
        public string CustomerId { get; set; }
        [DataMember]
        public bool PickUpInStore { get; set; }
        [DataMember]
        public int OrderStatusId { get; set; }
        [DataMember]
        public int ShippingStatusId { get; set; }
        [DataMember]
        public int PaymentStatusId { get; set; }
        [DataMember]
        public string PaymentMethodSystemName { get; set; }
        [DataMember]
        public string CustomerEmail { get; set; }
        [DataMember]
        public string FirstName { get; set; }
        [DataMember]
        public string LastName { get; set; }
        [DataMember]
        public decimal OrderDiscount { get; set; }
        [DataMember]
        public decimal OrderTotal { get; set; }
        [DataMember]
        public decimal RefundedAmount { get; set; }
        [DataMember]
        public string ShippingMethod { get; set; }
        [DataMember]
        public AddressDto BillingAddress { get; set; }
        [DataMember]
        public AddressDto ShippingAddress { get; set; }
        [DataMember]
        public List<OrderItemDto> OrderItems { get; set; }
        [DataMember]
        public PickupPointDto PickupPoint { get; set; }
    }
}
