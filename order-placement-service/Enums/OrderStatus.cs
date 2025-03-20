using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    /// <summary>
    /// Represents an order status enumeration
    /// </summary>
    public enum OrderStatus
    {
        /// <summary>
        /// Pending
        /// </summary>
        Created = 10,
        /// <summary>
        /// Processing
        /// </summary>
        Processing = 20,
        /// <summary>
        /// Complete
        /// </summary>
        Complete = 30,
        /// <summary>
        /// Cancelled
        /// </summary>
        Cancelled = 40,

        //clover
        open = 1,
        locked = 2
    }
}
