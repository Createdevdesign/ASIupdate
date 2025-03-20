using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    /// <summary>
    /// Represents an attribute value type
    /// </summary>
    public enum AttributeValueType
    {
        /// <summary>
        /// Simple attribute value
        /// </summary>
        Simple = 0,
        /// <summary>
        /// Associated to a product (used when configuring bundled products)
        /// </summary>
        AssociatedToProduct = 10,
    }
}
