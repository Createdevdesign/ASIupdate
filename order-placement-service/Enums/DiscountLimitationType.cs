using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SwiftServe.OrderService.WebApi.Enums
{
    public enum DiscountLimitationType
    {
        /// <summary>
        /// None
        /// </summary>
        Unlimited = 0,
        /// <summary>
        /// N Times Only
        /// </summary>
        NTimesOnly = 15,
        /// <summary>
        /// N Times Per Customer
        /// </summary>
        NTimesPerCustomer = 25,
    }
}
