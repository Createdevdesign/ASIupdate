using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Service.AuthService.PhoneValidation
{
    [DataContract]
    public class PhoneNumberVerificationRequestDto
    {
        [DataMember]
        public string PhoneNumber { get; set; }
        [DataMember]
        public string VerificationCode { get; set; }
        [DataMember]
        public string DeviceId { get; set; }
        [DataMember]
        public string DeviceType { get; set; }
        [DataMember]
        public string OS { get; set; }
        [DataMember]
        public Guid Uuid { get; set; }
        [DataMember]
        public string CountryCode { get; set; }
    }
}
