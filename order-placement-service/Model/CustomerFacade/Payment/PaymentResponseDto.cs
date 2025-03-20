using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.CustomerFacade.Payment
{
    [DataContract]
    public class PaymentResponseDto
    {
        [DataMember]
        public string PaymentReferenceId { get; set; }
    }
}
