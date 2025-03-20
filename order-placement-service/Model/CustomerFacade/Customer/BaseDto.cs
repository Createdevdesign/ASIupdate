using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class BaseDto
    {
        [DataMember]
        public string Username { get; set; }
    }
}
