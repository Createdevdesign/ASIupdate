using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.Card
{
    [DataContract]
    public class CardDeleteRequestDto
    {
        [DataMember]
        public string CustomerId { get; set; }
        [DataMember]
        public string CardId { get; set; }
    }
}
