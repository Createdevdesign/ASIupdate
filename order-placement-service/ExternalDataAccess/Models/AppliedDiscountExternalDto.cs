using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.ExternalDataAccess.Models
{
    public class AppliedDiscountExternalDto
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
