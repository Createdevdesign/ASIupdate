

namespace order_placement_service.Entities.Products
{
    /// <summary>
    /// Represents a product category mapping
    /// </summary>
    public class ProductCategory : ParentEntity
    {

        /// <summary>
        /// Gets or sets the product identifier
        /// </summary>
        public string ProductId { get; set; }
        /// <summary>
        /// Gets or sets the category identifier
        /// </summary>
        public string CategoryId { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the product is featured
        /// </summary>
        public bool IsFeaturedProduct { get; set; }

        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        public int DisplayOrder { get; set; }

    }
}
