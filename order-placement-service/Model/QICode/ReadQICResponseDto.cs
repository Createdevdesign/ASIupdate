using System;
using System.Runtime.Serialization;

namespace order_placement_service.Model.QICode
{
    [DataContract]
    public class ReadQICResponseDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string ExtId { get; set; }
        [DataMember]
        public string StoreId { get; set; }
        [DataMember]
        public string StoreName { get; set; }
        [DataMember]
        public string StoreAddress { get; set; }
        [DataMember]
        public string StorePhoneNumber { get; set; }
        [DataMember]
        public string StoreTiming { get; set; }
        [DataMember]
        public bool IsOpen { get; set; }
        [DataMember]
        public string Type { get; set; }
        [DataMember]
        public int Metadata { get; set; }
        [DataMember]
        public DateTime CreatedDt { get; set; }
        [DataMember]
        public string CreatedBy { get; set; }
        [DataMember]
        public bool PayAtStore { get; set; }
        [DataMember]
        public string DisplayText { get; set; }
        [DataMember]
        public bool IsDelivery { get; set; }
        [DataMember]
        public bool IsPickUp { get; set; }
    }
}
