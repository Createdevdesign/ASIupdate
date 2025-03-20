using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class SavePreferenceResponseDto
    {
        //[DataMember]
        //public List<string> Notifications { get; set; }
        [DataMember]
        public bool Inserted { get; set; }
    }
}
