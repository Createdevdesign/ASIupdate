using System.Collections.Generic;

namespace order_placement_service.Model.Consumerpayment
{
    public class CreateCustomerRequest        
    {
        public string Id { get; set; }
        public string FirstName { get; set; }

        public string LastName { get; set; }
        public string Company { get; set; }
        public string Email { get; set; }
        public string Fax { get; set; }
        public string Phone { get; set; }

        public string Locality { get; set; }
        public string ExtendedAddress { get; set; }
        public string StreetAddress { get; set; }
        
        public string CountryCode { get; set; }
        public string CountryName { get; set; }
        public string Region { get; set; }
        public string PostalCode { get; set; }
        public string CardType { get; set; }
        public string CardholderName { get; set; }
        //The expiration date, formatted MMYY 
        public string CardNumber { get; set; }
        public string ExpirationMonth { get; set; }
        public string ExpirationYear { get; set; }
        public string Cvv { get; set; }
        public string Nonce { get; set; }
    }

    #region Commented Code
    //public class CreateCustomerRequest
    //{
    //    public string Id { get; set; }
    //    public string CustomerId { get; set; }
    //    public string FirstName { get; set; }
    //    public string LastName { get; set; }
    //    public string Email { get; set; }
    //    public string Company { get; set; }
    //    public string Phone { get; set; }
    //    public string Website { get; set; }
    //    public string Fax { get; set; }
    //    public string DeviceData { get; set; }
    //    public string DefaultPaymentMethodToken { get; set; }
    //    public string PaymentMethodNonce { get; set; }
    //    public RiskProtectionData RiskData { get; set; }
    //    public CreditCardInfo CreditCard { get; set; }
    //    public Dictionary<string, string> CustomFields { get; set; }
    //}

    //public class RiskProtectionData
    //{
    //    public string CustomerIP { get; set; }
    //    public string CustomerBrowser { get; set; }
    //}

    //public class CreditCardInfo
    //{
    //    public string CustomerId { get; set; }
    //    public string CardholderName { get; set; }
    //    public string CVV { get; set; }
    //    public string ExpirationMonth { get; set; }
    //    public string ExpirationYear { get; set; }
    //    public string ExpirationDate { get; set; }
    //    public string Number { get; set; }
    //    public CreditCardAddress BillingAddress { get; set; }
    //    public string BillingAddressId { get; set; }
    //    public string DeviceData { get; set; }
    //    public string DeviceSessionId { get; set; }
    //    public string FraudMerchantId { get; set; }
    //    public string PaymentMethodToken { get; set; }
    //    public string PaymentMethodNonce { get; set; }
    //    public string Token { get; set; }
    //}

    //public class CreditCardAddress
    //{
    //    public string Company { get; set; }
    //    public string CountryCodeAlpha3 { get; set; }
    //    public string CountryCodeAlpha2 { get; set; }
    //    public string PostalCode { get; set; }
    //    public string Region { get; set; }
    //    public string Locality { get; set; }
    //    public string ExtendedAddress { get; set; }
    //    public string StreetAddress { get; set; }
    //    public string CountryName { get; set; }
    //    public string LastName { get; set; }
    //    public string FirstName { get; set; }
    //    public string CountryCodeNumeric { get; set; }
    //} 
    #endregion
}
