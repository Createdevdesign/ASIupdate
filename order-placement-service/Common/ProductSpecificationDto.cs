using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Common
{ 
    [DataContract]
    public class ProductSpecificationDto
    {
        [DataMember]
        public string  Id { get; set; }
        [DataMember]
        public string AttributeName { get; set; }
        [DataMember]
        public List<SpecificationAttributeOptionDto> AttributeValues { get; set; }
        [DataMember]
        public int DisplayOrder { get; set; }
        [DataMember]
        public string AttributeType { get; set; }
    }

    [DataContract]
    public class SpecificationAttributeOptionDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public int DisplayOrder { get; set; }
    }

}
