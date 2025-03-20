

using order_placement_service.Repository.Interfaces;
using System;
using System.Collections.Generic;

namespace order_placement_service.Model.Consumerpayment
{
    public class CreditCardTransactionResponse : ICreditCardTransactionResponse
    {
        public decimal? TxnAmt { get; set; }

        public string MerchantAccountId { get; set; }

        public bool? IsTaxExempt { get; set; }

        public decimal? TaxAmt { get; set; }

        public decimal? ServiceFeeAmt { get; set; }

        public string AuthorizedTransactionId { get; set; }

        public string SettlementBatchId { get; set; }

        public string SubscriptionId { get; set; }

        public string PurchaseOrderNumer { get; set; }

        public string VoiceReferralNumber { get; set; }

        public string AdditionalProcessorResponse { get; set; }

        public string ProcessorSettlementResponseText { get; set; }

        public string AvsErrorResponseCode { get; set; }

        public string AvsPostalCodeResponseCode { get; set; }

        public string AvsStreetAddressResponseCode { get; set; }

        public string Channel { get; set; }

        public string CurrencyIsoCode { get; set; }

        public string ProcessorSettlementResponseCode { get; set; }

        public string ProcessorResponseText { get; set; }

        public string CvvResponseCode { get; set; }

        public string ProcessorAuthorizationCode { get; set; }

        public string PlanId { get; set; }

        public string ProcessorResponseCode { get; set; }

        public string Type { get; set; }

        public string Brand { get; set; }
        public string Last4 { get; set; }


        #region Stripe


        public bool Paid { get; set; }

        public string PaymentIntentId { get; set; }

        public string ReceiptEmail { get; set; }

        public string ReceiptNumber { get; set; }

        public string ReceiptUrl { get; set; }

        public string OnBehalfOfId { get; set; }

        public bool Refunded { get; set; }

        public string ReviewId { get; set; }

        public string SourceTransferId { get; set; }

        public string StatementDescriptor { get; set; }

        public string TransferId { get; set; }

        public Dictionary<string, string> Metadata { get; set; }

        public bool Livemode { get; set; }

        public string Id { get; set; }

        public string ObjectData { get; set; }

        public long Amount { get; set; }

        public long AmountRefunded { get; set; }

        public string ApplicationId { get; set; }

        public string ApplicationFeeId { get; set; }

        public long? ApplicationFeeAmount { get; set; }

        public string BalanceTransactionId { get; set; }

        public bool? Captured { get; set; }

        public DateTime Created { get; set; }

        public string Currency { get; set; }

        public string CustomerId { get; set; }

        public string Description { get; set; }

        public string DestinationId { get; set; }

        public string DisputeId { get; set; }

        public string FailureCode { get; set; }

        public string FailureMessage { get; set; }

        public Dictionary<string, string> FraudDetails { get; set; }

        public string InvoiceId { get; set; }

        public string TransferGroup { get; set; }

        public string AuthorizationCode { get; set; }

        #endregion


        #region Common Attributes


        public string Status { get; set; }

        public string OrderId { get; set; }

        public string TxnId { get; set; }

        public int ExtTransactionId { get; set; }

        public string RequestPayload { get; set; }

        public string ResponsePayload { get; set; }

        public bool HasSucceeded { get; set; }

        public List<Tuple<long, long, long>> ReservationDetails { get; set; }

        #endregion
    }
}
