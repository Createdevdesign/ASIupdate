using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.Payment
{
    [DataContract]
    public class PaymentCaptureRequestDto
    {
        [DataMember]
        public string ChargeId { get; set; }
    }
}
