using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.Card
{
    [DataContract]
    public class CardRequestDto
    {
        [DataMember]
        public string Token { get; set; }
    }
}
