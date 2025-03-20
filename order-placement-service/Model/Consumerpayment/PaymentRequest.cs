using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.Consumerpayment
{
    public class PaymentRequest
    {
        public string OrderId { get; set; }
        public string CustomerId { get; set; }
        public string Token { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
    }
}
