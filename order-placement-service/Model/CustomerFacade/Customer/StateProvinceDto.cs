using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class StateProvinceDto
    {
        [DataMember]
        public List<StateProvinces> StateProvinces { get; set; }
    }

    [DataContract]
    public class StateProvinces
    {
        [DataMember]
        public string StateProvinceId { get; set; }
        [DataMember]
        public string StateProvinceCode { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public int DisplayOrder { get; set; }
    }
}
