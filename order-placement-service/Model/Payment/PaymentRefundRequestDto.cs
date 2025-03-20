using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.Payment
{
    [DataContract]
    public class PaymentRefundRequestDto
    {
        [DataMember]
        public string OrderId { get; set; }
        [DataMember]
        public string Charge { get; set; }
    }
}
