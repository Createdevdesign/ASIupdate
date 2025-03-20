using System;

namespace order_placement_service.Model.Consumerpayment
{
    public class CreateCustomerResponse
    {
        public string Website { get; set; }
        public string Fax { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Company { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string Id { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public CustomerAddress CustomerAddress { get; set; }
        public string RequestPayload { get; set; }
        public string ResponsePayload { get; set; }
        public string Token { get; set; }
    }

    public class CustomerAddress
    {
        public string CountryName { get; protected set; }
        public string CountryCodeNumeric { get; protected set; }
        public string CountryCodeAlpha3 { get; protected set; }
        public string CountryCodeAlpha2 { get; protected set; }
        public string PostalCode { get; protected set; }
        public string Region { get; protected set; }
        public string Locality { get; protected set; }
        public string ExtendedAddress { get; protected set; }
        public string StreetAddress { get; protected set; }
        public string Company { get; protected set; }
        public string LastName { get; protected set; }
        public string FirstName { get; protected set; }
        public string CustomerId { get; protected set; }
        public string Id { get; protected set; }
        public DateTime? CreatedAt { get; protected set; }
        public DateTime? UpdatedAt { get; protected set; }
    }
}
