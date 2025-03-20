using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    /// <summary>
    /// Represents a download activation type
    /// </summary>
    public enum DownloadActivationType
    {
        /// <summary>
        /// When order is paid
        /// </summary>
        WhenOrderIsPaid = 0,
        /// <summary>
        /// Manually
        /// </summary>
        Manually = 10,
    }
}
