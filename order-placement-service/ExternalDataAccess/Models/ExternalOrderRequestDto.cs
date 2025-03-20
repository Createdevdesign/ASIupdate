
using System.Collections.Generic;

namespace order_placement_service.ExternalDataAccess.Models
{
    public class ExternalOrderRequestDto
    {
        public string status { get; set; }
        public List<Customer> customers { get; set; }
        public bool taxRemoved { get; set; }
        public decimal total { get; set; }
        public string externalReferenceId { get; set; }
        public string note { get; set; }
        public string title { get; set; }
        public string paymentState { get; set; }
        public List<LineItems> lineItems { get; set; }
    }

    public class EmailAddresses
    {
        public string emailAddress { get; set; }
    }

    public class PhoneNumbers
    {
        public string phoneNumber { get; set; }
    }

    public class Customer
    {
        public List<EmailAddresses> emailAddresses { get; set; }
        public List<PhoneNumbers> phoneNumbers { get; set; }
        public string id { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
    }

    public class LineItems
    {
        public bool printed { get; set; }
        public bool exchanged { get; set; }
        public bool refunded { get; set; }
        public Refund refund { get; set; }
        public bool isRevenue { get; set; }
        public string name { get; set; }
        public string alternateName { get; set; }
        public decimal price { get; set; }
    }

    public class TransactionInfo
    {
        public bool isTokenBasedTx { get; set; }
        public bool emergencyFlag { get; set; }
    }

    public class Refund
    {
        public TransactionInfo transactionInfo { get; set; }
    }
}
