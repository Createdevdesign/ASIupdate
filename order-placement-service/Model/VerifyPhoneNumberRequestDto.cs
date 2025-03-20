using Newtonsoft.Json;
using System;

using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model
{
    [DataContract]
    public class VerifyPhoneNumberRequestDto
    {
        [DataMember, JsonProperty("Phone_Number")]
        public string PhoneNumber { get; set; }
        [DataMember, JsonProperty("Country_Code")]
        public string CountryCode { get; set; }
        [DataMember, JsonProperty("Verification_Code")]
        public string VerificationCode { get; set; }
        [DataMember]
        public string Uuid { get; set; }
    }
}
