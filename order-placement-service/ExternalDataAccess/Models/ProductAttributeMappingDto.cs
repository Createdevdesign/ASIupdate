
using order_placement_service.Common;
using System.Collections.Generic;

namespace order_placement_service.ExternalDataAccess.Models
{
    public class ProductAttributeMappingDto
    {
        public string ProductId { get; set; }
        public string ProductAttributeId { get; set; }
        public bool IsRequired { get; set; }
        public int AttributeControlTypeId { get; set; }
        public int DisplayOrder { get; set; }
        public string DefaultValue { get; set; }
        public List<ProductAttributeValueDto> ProductAttributeValues { get; set; }
        public string ExternalId { get; set; }
    }
}
