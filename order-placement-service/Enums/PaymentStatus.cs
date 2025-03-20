using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    public enum PaymentStatus
    {
        /// <summary>
        /// Pending
        /// </summary>
        Pending = 10,
        /// <summary>
        /// Authorized
        /// </summary>
        Authorized = 20,
        /// <summary>
        /// Paid
        /// </summary>
        Paid = 30,
        /// <summary>
        /// Partially Refunded
        /// </summary>
        PartiallyRefunded = 35,
        /// <summary>
        /// Refunded
        /// </summary>
        Refunded = 40,
        /// <summary>
        /// Voided
        /// </summary>
        Voided = 50,
        /// <summary>
        /// PayAtStore
        /// </summary>
        PayAtStore = 60,

        //Clover 
        OPEN = 1,
        PAID = 2,
        REFUNDED = 3,
        CREDITED = 4,
        PARTIALLY_PAID = 5,
        PARTIALLY_REFUNDED = 6
    }
}
