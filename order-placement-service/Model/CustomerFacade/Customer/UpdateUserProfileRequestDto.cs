using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class UpdateUserProfileRequestDto
    {
        [DataMember]
        public string Firstname { get; set; }
        [DataMember]
        public string Lastname { get; set; }
        [DataMember]
        public string Username { get; set; }
        [DataMember]
        public string Email { get; set; }
        [DataMember]
        public bool Active { get; set; }
        [DataMember]
        public bool Deleted { get; set; }
        [DataMember]
        public AddressDto ShippingAddress { get; set; }
        [DataMember]
        public string DisplayName { get; set; }
    }
}
