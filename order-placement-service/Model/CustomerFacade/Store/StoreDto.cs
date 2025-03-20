using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Store
{
    [DataContract]
    public class StoreDto
    {
        [DataMember]
        public string _id { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public string Shortcut { get; set; }
        [DataMember]
        public string Url { get; set; }
        [DataMember]
        public bool SslEnabled { get; set; }
        [DataMember]
        public object SecureUrl { get; set; }
        [DataMember]
        public string Hosts { get; set; }
        [DataMember]
        public int DisplayOrder { get; set; }
        [DataMember]
        public string CompanyName { get; set; }
        [DataMember]
        public string CompanyAddress { get; set; }
        [DataMember]
        public string CompanyPhoneNumber { get; set; }
        [DataMember]
        public object CompanyVat { get; set; }
        [DataMember]
        public string CompanyEmail { get; set; }
        [DataMember]
        public string CompanyHours { get; set; }
    }
}
