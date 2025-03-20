using System.Runtime.Serialization;

namespace order_placement_service.ExternalDataAccess.Models
{
    [DataContract]
    public class StoreDto
    {
        [DataMember]
        public string Id { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string CompanyName { get; set; }

        [DataMember]
        public string CompanyAddress { get; set; }

        [DataMember]
        public string CompanyPhoneNumber { get; set; }
        [DataMember]
        public string CompanyEmail { get; set; }
        [DataMember]
        public string CompanyHours { get; set; }
        [DataMember]
        public bool IsDefault { get; set; }
        [DataMember]
        public bool PayAtStore { get; set; }
        [DataMember]
        public ThirdPartyConfigDto ThirdPartyConfig { get; set; }
    }

    [DataContract]
    public class ThirdPartyConfigDto
    {
        [DataMember]
        public string IntegrationChannel { get; set; }
        [DataMember]
        public string MerchantId { get; set; }
        [DataMember]
        public string AccessToken { get; set; }
        [DataMember]
        public string BaseUrl { get; set; }
        [DataMember]
        public bool IsEnabled { get; set; }
    }
}
