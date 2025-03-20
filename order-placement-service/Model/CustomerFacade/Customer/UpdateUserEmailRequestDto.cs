
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class UpdateUserEmailRequestDto:BaseDto
    {
        [DataMember]
        public string Email { get; set; }
        [DataMember]
        public string DisplayName { get; set; }
    }
}
