
using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade.Order
{
    [DataContract]
    public class OrderDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public int OrderNumber { get; set; }
        [DataMember]
        public string StoreId { get; set; }
        [DataMember]
        public string CustomerId { get; set; }
        [DataMember]
        public int OrderStatusId { get; set; }
        [DataMember]
        public string PaymentStatus { get; set; }
        [DataMember]
        public int PaymentStatusId { get; set; }
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
        public decimal TipAmount { get; set; }
    }
}
