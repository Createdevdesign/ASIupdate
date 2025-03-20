using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    /// <summary>
    /// Represents a method of inventory management
    /// </summary>
    public enum ManageInventoryMethod
    {
        /// <summary>
        /// Don't track inventory for product
        /// </summary>
        DontManageStock = 0,
        /// <summary>
        /// Track inventory for product
        /// </summary>
        ManageStock = 1,
        /// <summary>
        /// Track inventory for product by product attributes
        /// </summary>
        ManageStockByAttributes = 2,
        /// <summary>
        /// Track inventory for product by bundle products
        /// </summary>
        ManageStockByBundleProducts = 3,
    }
}
