using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    /// <summary>
    /// Represents a product category mapping
    /// </summary>
    [DataContract]
    public class ProductCategoryDto
    {
        [DataMember]
        public string CategoryId { get; set; }
    }
}
