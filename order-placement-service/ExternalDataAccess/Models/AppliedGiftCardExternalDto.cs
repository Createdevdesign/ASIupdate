using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.ExternalDataAccess.Models
{
  public  class AppliedGiftCardExternalDto
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
