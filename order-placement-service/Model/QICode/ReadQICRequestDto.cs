
using order_placement_service.Model.CustomerFacade.Customer;
using System.Runtime.Serialization;

namespace order_placement_service.Model.QICode
{
    [DataContract]
    public class ReadQICRequestDto : BaseDto
    {
        [DataMember]
        public string ExtId { get; set; }
    }
}
