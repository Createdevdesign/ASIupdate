
using order_placement_service.Model.CustomerFacade.Customer;
using System.Runtime.Serialization;

namespace order_placement_service.Model.QICode
{
    [DataContract]
    public class CreateQICRequestDto : BaseDto
    {
        [DataMember]
        public string ExtId { get; set; }
        [DataMember]
        public string StoreId { get; set; }
        [DataMember]
        public string Type { get; set; }
        [DataMember]
        public int Metadata { get; set; }
    }
}
