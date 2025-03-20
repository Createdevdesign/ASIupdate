using System;
using System.Collections.Generic;

namespace order_placement_service.Model.Consumerpayment
{
    public class RefundCreditCardTransactionRequest
    {
        
        public string OrderId { get; set; }

        #region Common Attributes

        public string Charge { get; set; }

        public decimal Amount { get; set; }

        #endregion

        #region Stripe Attributes

        public bool? ShouldReverseTransfer { get; set; }

        public bool? ShouldRefundApplicationFee { get; set; }

        public EnumRefundReason RefundReason { get; set; }

        public Dictionary<string,string> AdditonalInfo { get; set; }

        #endregion

    }
}

