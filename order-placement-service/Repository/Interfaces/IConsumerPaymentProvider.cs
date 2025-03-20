using order_placement_service.Model.Consumerpayment;
using Stripe;

using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface IConsumerPaymentProvider
    {
        Task<PaymentIntent> RetrievePaymentIntent(string intentId);
        Task<PaymentIntent> CancelPaymentIntent(string intentId);
        Task<CreditCardTransactionResponse> ProcessSaleTransactionIntent(ICreditCardTransactionRequest creditCardTransaction);
        Task<CreditCardTransactionResponse> ProcessSaleTransaction(ICreditCardTransactionRequest creditCardTransaction);
        Task<CreditCardTransactionResponse> UpdateCharge(UpdateChargeRequest updateChargeRequest);
        Task<CreditCardTransactionResponse> QueueBasedProcessSaleTransaction(ICreditCardTransactionRequest creditCardTransaction);
        Task<CreditCardTransactionResponse> RetrieveParticularSaleTransactionDetails(string transactionId);
        Task<CreditCardTransactionResponse> RefundSaleTransaction(RefundCreditCardTransactionRequest refundCreditCardTransactionRequest);
        Task<List<CreditCardTransactionResponse>> RetrieveAllCustomerTransactionDetails(string customerId);
        Task<CreditCardTransactionResponse> VoidSaleTransaction(VoidCreditCardTransactionRequest voidCreditCardTransactionRequest);
        Task<CreateCustomerResponse> UpdateCustomer(string id, CreateCustomerRequest createCustomerRequest);
        Task<string> GenerateToken(string customerId = null);
        Task<CreateCustomerResponse> FindCustomer(CustomerRequest customerRequest);
        Task<CreditCardTransactionResponse> ProcessCardVerificationTransaction(ICreditCardTransactionRequest creditCardTransaction);
        Task<PaymentResponse> ProcessPayment(PaymentRequest paymentRequest);
        Task<CreditCardTransactionResponse> CaptureSaleTransaction(CreditCardPaymentCaptureRequest creditCardPaymentCaptureRequest);
        Task<CardResponse> SaveCard(CardRequest cardRequest);
        Task<CardResponse> DeleteCard(CardDeleteRequest cardDeleteRequest);
        Task<CardListResponse> ListCards(CardListRequest cardListRequest);
    }
}
