using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    /// <summary>
    /// Represents a low stock activity
    /// </summary>
    public enum LowStockActivity
    {
        /// <summary>
        /// Nothing
        /// </summary>
        Nothing = 0,
        /// <summary>
        /// Disable buy button
        /// </summary>
        DisableBuyButton = 1,
        /// <summary>
        /// Unpublish
        /// </summary>
        Unpublish = 2,
    }
}
