
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class UserProfileResponseDto
    {
        [DataMember]
        public string CustomerId { get; set; }
        [DataMember]
        public string Username { get; set; }
        [DataMember]
        public string Email { get; set; }
        [DataMember]
        public bool Active { get; set; }
        [DataMember]
        public bool Deleted { get; set; }
        [DataMember]
        public Common.AddressDto ShippingAddress { get; set; }
        [DataMember]
        public NotificationDto Preference { get; set; }
        [DataMember]
        public string DisplayName { get; set; }
        [DataMember]
        public bool IsEmailVerified { get; set; }
    }
}
