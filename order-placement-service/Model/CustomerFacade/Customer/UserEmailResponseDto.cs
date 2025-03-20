using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class UserEmailResponseDto
    {
        [DataMember]
        public string UserName { get; set; }
        [DataMember]
        public string DisplayName { get; set; }
        [DataMember]
        public bool Active { get; set; }
        [DataMember]
        public bool Deleted { get; set; }

        [DataMember]
        public string Email { get; set; }

    }
}
