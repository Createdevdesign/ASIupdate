using System;
using System.Runtime.Serialization;

namespace order_placement_service.Service.AuthService.PhoneValidation
{
    [DataContract]
    public class PhoneVerificationCodeRequestDto
    {
        [DataMember]
        public string PhoneNumber { get; set; }
        [DataMember]
        public string CountryCode { get; set; }
    }
}
