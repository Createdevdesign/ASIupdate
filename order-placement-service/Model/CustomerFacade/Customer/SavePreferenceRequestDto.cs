using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class SavePreferenceRequestDto
    {
        [DataMember]
        public string Username { get; set; }
        [DataMember]
        public List<string> Notifications { get; set; }
    }

}
