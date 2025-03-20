

using order_placement_service.Repository.Interfaces;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.Consumerpayment
{
    [KnownType(typeof(CreditCardTransactionRequest))]
    public class CreditCardTransactionRequest : ICreditCardTransactionRequest, IMonetaryTransaction
    {

        #region IMonetaryTransaction

        public string RequestedCurrency { get ; set; }
        public string BaseCurrency { get; set; }
        public decimal AmountInRequestedCurrency { get; set; }
        public decimal AmountInBaseCurrency { get; set; }
        public decimal FxRate { get; set; }


        #endregion 

        #region Stripe Attributes

        public string CustomerEmail { get; set; }

        public string Phone { get; set; }

        #endregion

        #region Common Attributes
        public string StoreId { get; set; }
        public string OrderId { get; set; }

        public string CustomerId { get; set; }

        public string Token { get; set; }

        public bool IsNativeBooking { get; set; } //Will be used for Braintree: "Submit for Settlement" or  Stripe: "Capture"

        public List<TransactionLineItem> LineItems { get; set; }

        public Dictionary<string, string> MetaData { get; set; }

        public decimal Amount { get; set; }

        public CCAddress Address { get; set; }

        public string ShippingPostal { get; set; }

        #endregion

        public decimal TaxAmount { get; set; }

        public decimal ShippingAmount { get; set; }

        public decimal DiscountAmount { get; set; }
        public string StoreName { get; set; }
        public string StorePhoneNumber { get; set; }
        CCAddress ICreditCardTransactionRequest.Address { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }
        List<TransactionLineItem> ICreditCardTransactionRequest.LineItems { get => throw new System.NotImplementedException(); set => throw new System.NotImplementedException(); }
    }
    public class CCAddress
    {
        public string City { get; set; }

        public string State { get; set; }

        public string PostalCode { get; set; }

        public string Alpha3 { get; set; }

        public string StreetAddress { get; set; }

        public string CountryName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string CountryCodeNumeric { get; set; }
    }
}
