using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Entities.Discounts
{
    /// <summary>
    /// Applied discount
    /// </summary>
    public class AppliedDiscount
    {
        /// <summary>
        /// Gets or sets the discount Id
        /// </summary>
        public string DiscountId { get; set; }

        /// <summary>
        /// Gets or sets the discount 
        /// </summary>
        public string CouponCode { get; set; }


        /// <summary>
        /// Gets or sets is discount is cumulative
        /// </summary>
        public bool IsCumulative { get; set; }
    }
}
