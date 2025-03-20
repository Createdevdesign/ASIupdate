using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.Consumerpayment
{
    public class CardResponse : BaseModel
    {
        public bool? DefaultForCurrency { get; set; }
        public bool? Deleted { get; set; }
        public string Description { get; set; }
        public string DynamicLast4 { get; set; }
        public long ExpMonth { get; set; }
        public long ExpYear { get; set; }
        public string CvcCheck { get; set; }
        public string Issuer { get; set; }
        public string Last4 { get; set; }
        public string Name { get; set; }
        public string CustomerId { get; set; }
        public string Currency { get; set; }
        public string Id { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string AddressState { get; set; }
        public string AddressZip { get; set; }
        public string Brand { get; set; }
        public string Country { get; set; }
    }
}
