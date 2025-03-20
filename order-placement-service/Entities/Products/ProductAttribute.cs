
using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Entities.Products
{
    /// <summary>
    /// Represents a product attribute
    /// </summary>
    public partial class ProductAttribute : BaseEntity
    {
        public ProductAttribute()
        {
        }
        /// <summary>
        /// Gets or sets the name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the sename
        /// </summary>
        public string SeName { get; set; }

        /// <summary>
        /// Gets or sets the description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Gets or Sets 3rd Party Attributes
        /// Clover : ModifiersGroup
        /// </summary>
        public string ExternalAttributeId { get; set; }

        /// <summary>
        /// Gets or sets the collection of locales
        /// </summary>
        public IList<LocalizedProperty> Locales { get; set; }
        public List<PredefinedProductAttributeValue> PredefinedProductAttributeValues { get; set; }
    }
}
