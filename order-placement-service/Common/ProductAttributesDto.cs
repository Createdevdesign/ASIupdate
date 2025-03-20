using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using System.Collections.Generic;
using System.Runtime.Serialization;
namespace order_placement_service.Common
{
    [DataContract]
    public class ProductAttributesDto
    {
        /// <summary>
        /// 
        /// </summary>
        [DataMember]
        public string Id { get; set; }
        /// <summary>
        /// Gets or sets the product attribute name
        /// </summary>
        [DataMember]
        public string ProductAttributeName { get; set; }
        ///// <summary>
        ///// Gets or sets the product attribute identifier
        ///// </summary>
        [DataMember]
        public string ProductAttributeId { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [DataMember]
        public List<ProductAttributeValueDto> ProductAttributeValues { get; set; }
        /// <summary>
        /// Gets or sets a value indicating whether the entity is required
        /// </summary>
        [DataMember]
        public bool IsRequired { get; set; }
        /// <summary>
        /// Gets or sets the attribute control type identifier
        /// </summary>
        [DataMember]
        public int AttributeControlTypeId { get; set; }
        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        [DataMember]
        public int DisplayOrder { get; set; }
        [DataMember]
        public string AttributeControlType { get; set; }
        /// <summary>
        /// Gets or sets the name
        /// </summary>
        [DataMember]
        public string Name { get; set; }
        /// <summary>
        /// Gets or sets the sename
        /// </summary>
        [DataMember]
        public string SeName { get; set; }
        /// <summary>
        /// Gets or Sets 3rd Party Attributes
        /// Clover : ModifiersGroup
        /// </summary>
        [DataMember]
        public string ExternalAttributeId { get; set; }
    }
}
