﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    /// <summary>
    /// Represents a product type
    /// </summary>
    public enum ProductType
    {
        /// <summary>
        /// Simple
        /// </summary>
        SimpleProduct = 5,
        /// <summary>
        /// Grouped (product with variants)
        /// </summary>
        GroupedProduct = 10,

        /// <summary>
        /// Reservation product
        /// </summary>
        Reservation = 15,

        /// <summary>
		/// Bundled product
		/// </summary>
		BundledProduct = 20,

        /// <summary>
        /// Auction
        /// </summary>
        Auction = 25
    }
}
