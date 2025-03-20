using System;

namespace order_placement_service.Model.Consumerpayment
{
    public class VoidCreditCardTransactionRequest
    {
        public string TransactionId { get; set; }

        public string OrderId { get; set; }

        public decimal Amount { get; set; }

        public EnumRefundReason RefundReason { get; set; }

    }
}
