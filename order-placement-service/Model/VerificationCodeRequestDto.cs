
using order_placement_service.Model.BusinessBase;
using System.Runtime.Serialization;



namespace order_placement_service.Model
{
    [DataContract]
    public class VerificationCodeRequestDto : BaseDto
    {
        [DataMember]
        public string Via { get; set; }
        [DataMember]
        public string PhoneNumber { get; set; }
        [DataMember]
        public string CountryCode { get; set; }
        [DataMember]
        public string CodeLength { get; set; }
        [DataMember]
        public string Locale { get; set; }
    }
}
