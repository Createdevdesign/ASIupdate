using System.Runtime.Serialization;

namespace order_placement_service.ExternalDataAccess.Models
{
    /// <summary>
    /// Represents a product category mapping
    /// </summary>
    [DataContract]
    public class ProductCategoryDto
    {
        [DataMember]
        public string CategoryId { get; set; }
        [DataMember]
        public string ExternalId { get; set; }
        [DataMember]
        public bool IsFeaturedProduct { get; set; }
        [DataMember]
        public int DisplayOrder { get; set; }
    }
}
