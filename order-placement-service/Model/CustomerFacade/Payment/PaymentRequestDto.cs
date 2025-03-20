using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.CustomerFacade.Payment
{
    [DataContract]
    public class PaymentRequestDto
    {
        [DataMember]
        public string OrderId { get; set; }
        [DataMember]
        public string CustomerId { get; set; }
        [DataMember]
        public string Token { get; set; }
        [DataMember]
        public decimal Amount { get; set; }
        [DataMember]
        public string Description { get; set; }
    }
}
