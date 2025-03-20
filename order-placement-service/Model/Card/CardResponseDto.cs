using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.Card
{
    [DataContract]
    public class CardResponseDto
    {
        [DataMember]
        public bool? Deleted { get; set; }
        [DataMember]
        public string Description { get; set; }
        [DataMember]
        public string DynamicLast4 { get; set; }
        [DataMember]
        public long ExpMonth { get; set; }
        [DataMember]
        public long ExpYear { get; set; }
        [DataMember]
        public string CvcCheck { get; set; }
        [DataMember]
        public string Last4 { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public string CustomerId { get; set; }
        [DataMember]
        public string Currency { get; set; }
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string Brand { get; set; }
        [DataMember]
        public string ErrorMessage { get; set; }
        [DataMember]
        public bool Success { get; set; }
    }
}
