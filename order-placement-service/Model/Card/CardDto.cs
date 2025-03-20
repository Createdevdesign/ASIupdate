using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.Card
{
    [DataContract]
    public class CardDto
    {
        [DataMember]
        [JsonProperty("default_for_currency")]
        public bool? DefaultForCurrency { get; set; }
        [DataMember]
        [JsonProperty("deleted", NullValueHandling = NullValueHandling.Ignore)]
        public bool? Deleted { get; set; }
        [DataMember]
        [JsonProperty("description")]
        public string Description { get; set; }
        [DataMember]
        [JsonProperty("dynamic_last4")]
        public string DynamicLast4 { get; set; }
        [DataMember]
        [JsonProperty("exp_month")]
        public long ExpMonth { get; set; }
        [DataMember]
        [JsonProperty("exp_year")]
        public long ExpYear { get; set; }
        [DataMember]
        [JsonProperty("cvc_check")]
        public string CvcCheck { get; set; }
        [DataMember]
        [JsonProperty("issuer")]
        public string Issuer { get; set; }
        [DataMember]
        [JsonProperty("last4")]
        public string Last4 { get; set; }
        [DataMember]
        [JsonProperty("name")]
        public string Name { get; set; }
        [DataMember]
        [JsonIgnore]
        public string CustomerId { get; set; }
        [DataMember]
        [JsonProperty("currency")]
        public string Currency { get; set; }
        [DataMember]
        [JsonProperty("id")]
        public string Id { get; set; }
        [DataMember]
        [JsonProperty("address_line1")]
        public string AddressLine1 { get; set; }
        [DataMember]
        [JsonProperty("address_line2")]
        public string AddressLine2 { get; set; }
        [DataMember]
        [JsonProperty("address_state")]
        public string AddressState { get; set; }
        [DataMember]
        [JsonProperty("address_zip")]
        public string AddressZip { get; set; }
        [DataMember]
        [JsonProperty("brand")]
        public string Brand { get; set; }
        [DataMember]
        [JsonProperty("country")]
        public string Country { get; set; }
    }
}
