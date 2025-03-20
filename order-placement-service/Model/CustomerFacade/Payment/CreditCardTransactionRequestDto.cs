
using order_placement_service.Model.CustomerFacade.Customer;

using System.Collections.Generic;
using System.Runtime.Serialization;

using order_placement_service.Model.CustomerFacade.Payment;

namespace SwiftServe.CustomerService.Facade.Payment
{
    [DataContract]
    public class CreditCardTransactionRequestDto : BaseDto
    {
        #region Common Attributes
        [DataMember]
        public string OrderId { get; set; }
        [DataMember]
        public string CustomerId { get; set; }
        [DataMember]
        public string Token { get; set; }
        //[DataMember]
        //public bool IsNativeBooking { get; set; } //Will be used for Braintree: "Submit for Settlement" or  Stripe: "Capture"
        [DataMember]
        public List<TransactionLineItemDto> LineItems { get; set; }
        [DataMember]
        public Dictionary<string, string> MetaData { get; set; }
        [DataMember]
        public decimal Amount { get; set; }
        [DataMember]
        public CCAddressDto Address { get; set; }
        [DataMember]
        public string ShippingPostal { get; set; }

        #endregion
        [DataMember]
        public decimal TaxAmount { get; set; }
        [DataMember]
        public decimal ShippingAmount { get; set; }
        [DataMember]
        public decimal DiscountAmount { get; set; }
    }
    [DataContract]
    public class CCAddressDto
    {
        [DataMember]
        public string City { get; set; }
        [DataMember]
        public string State { get; set; }
        [DataMember]
        public string PostalCode { get; set; }
        [DataMember]
        public string Alpha3 { get; set; }
        [DataMember]
        public string StreetAddress { get; set; }
        [DataMember]
        public string CountryName { get; set; }
        [DataMember]
        public string FirstName { get; set; }
        [DataMember]
        public string LastName { get; set; }
        [DataMember]
        public string CountryCodeNumeric { get; set; }
    }
}
