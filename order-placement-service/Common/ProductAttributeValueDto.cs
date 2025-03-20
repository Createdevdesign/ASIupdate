using System.Runtime.Serialization;

namespace order_placement_service.Common
{
    [DataContract]
    public class ProductAttributeValueDto
    {
        /// <summary>
        /// Gets or sets the Id
        [DataMember]
        public string Id { get; set; }
        /// <summary>
        /// Gets or sets the product attribute name
        /// </summary>
        [DataMember]
        public string Name { get; set; }
        /// <summary>
        /// Gets or sets the price adjustment (used only with AttributeValueType.Simple)
        /// </summary>
        [DataMember]
        public decimal PriceAdjustment { get; set; }
        /// <summary>
        /// Gets or sets the attibute value cost (used only with AttributeValueType.Simple)
        /// </summary>
        [DataMember]
        public decimal Cost { get; set; }
        /// <summary>
        /// Gets or sets a value indicating whether the value is pre-selected
        /// </summary>
        [DataMember]
        public bool IsPreSelected { get; set; }
        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        [DataMember]
        public int DisplayOrder { get; set; }
        /// <summary>
        /// Gets or Sets 3rd Party Attributes
        /// Clover : Modifiers
        /// </summary>
        [DataMember]
        public string ExternalAttributeId { get; set; }
    }
}
