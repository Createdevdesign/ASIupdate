using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.Consumerpayment
{
    public class UpdateChargeRequest
    {
        public string ChargeId { get; set; }
        public string OrderId { get; set; }
        public string StoreId { get; set; }

        public string CustomerId { get; set; }
    }
}
