﻿using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Entities.Discounts
{
    /// <summary>
    /// Applied gift card
    /// </summary>
    public class AppliedGiftCard
    {
        /// <summary>
        /// Gets or sets the used value
        /// </summary>
        public decimal AmountCanBeUsed { get; set; }

        ///// <summary>
        ///// Gets the gift card
        ///// </summary>
        //public GiftCard GiftCard { get; set; }
    }
}
