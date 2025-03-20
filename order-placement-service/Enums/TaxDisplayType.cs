using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    /// <summary>
    /// Represents the tax display type enumeration
    /// </summary>
    public enum TaxDisplayType
    {
        /// <summary>
        /// Including tax
        /// </summary>
        IncludingTax = 0,
        /// <summary>
        /// Excluding tax
        /// </summary>
        ExcludingTax = 10,
    }
}
