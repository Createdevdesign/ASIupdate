

using order_placement_service.Model.Consumerpayment;
using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Repository.Interfaces
{
    public interface ICreditCardTransactionRequest
    {
        string OrderId { get; set; }
        string CustomerId { get; set; }
        string Token { get; set; }
        bool IsNativeBooking { get; set; }
        decimal Amount { get; set; }
        string ShippingPostal { get; set; }
        CCAddress Address { get; set; }
        List<TransactionLineItem> LineItems { get; set; }
        Dictionary<string, string> MetaData { get; set; }
    }
}
