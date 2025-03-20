using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Stripe;
using order_placement_service.Model.Consumerpayment;
using order_placement_service.Repository.Interfaces;

namespace order_placement_service.Repository.Implementation
{
    public class StripeDuplicateContractResolver : DefaultContractResolver
    {
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            var property = base.CreateProperty(member, memberSerialization);

            if (property.PropertyName.ToUpper().Equals("SOURCE") && member.Name.ToUpper().Contains("SOURCECARD"))
            {
                property.PropertyName = "SourceCardNestedOptions";
            }
            return property;
        }
    }

    public class StripeConsumerPaymentProvider : IConsumerPaymentProvider
    {
        public async Task<CreateCustomerResponse> FindCustomer(CustomerRequest customerRequest)
        {
            var customerService = new Stripe.CustomerService();
            var data = await customerService.ListAsync(new CustomerListOptions
            {
                Email = customerRequest.Email
            });
            var customer = default(Customer);
            if (data.Any())
            {
                customer = data.FirstOrDefault();
            }
            else
            {
                customer = await customerService.CreateAsync(new CustomerCreateOptions
                {
                    Email = customerRequest.Email,
                    Name = customerRequest.Name,
                    Phone = customerRequest.Phone
                });
            }
            if (customer != null)
            {
                return new CreateCustomerResponse
                {
                    Email = customer.Email,
                    Id = customer.Id,
                };
            }
            return null;
        }

        public async Task<CardResponse> SaveCard(CardRequest creditCardTransaction)
        {
            var cardService = default(CardService);
            var cardResponse = default(CardResponse);
            try
            {
                CustomerRequest customerRequest = new CustomerRequest
                {
                    Email = creditCardTransaction.Email,
                    Name = creditCardTransaction.Name,
                    Phone = creditCardTransaction.Phone
                };
                var customerResult = await FindCustomer(customerRequest);
                var options = new CardCreateOptions
                {
                    Source = creditCardTransaction.Token,
                };
                cardService = new CardService();
                Card cardResp = await cardService.CreateAsync(customerResult.Id, options);
                if (cardResp != null)
                {
                    cardResponse = PrepareCardResponse(cardResp);
                }
                return cardResponse;
            }
            catch (StripeException stripeExcp)
            {
                cardResponse.Success = false;
                cardResponse.ErrorMessage = stripeExcp.StripeError.ErrorDescription;
            }
            catch (Exception ex)
            {
                cardResponse.Success = false;
                cardResponse.ErrorMessage = ex.Message;
            }
            return cardResponse;
        }

        public async Task<CardResponse> DeleteCard(CardDeleteRequest cardDeleteRequest)
        {
            var cardService = default(CardService);
            var cardResponse = new CardResponse();
            try
            {
                var customerResult = await FindCustomer(new CustomerRequest { Email = cardDeleteRequest.Email });
                cardService = new CardService();
                Card cardResp = await cardService.DeleteAsync(customerResult.Id, cardDeleteRequest.CardId);
                if (cardResp != null)
                {
                    cardResponse = PrepareCardResponse(cardResp);
                }
                return cardResponse;
            }
            catch (StripeException stripeExcp)
            {
                cardResponse.Success = false;
                cardResponse.ErrorMessage = stripeExcp.Message;
            }
            catch (Exception ex)
            {
                cardResponse.Success = false;
                cardResponse.ErrorMessage = ex.Message;
            }
            return cardResponse;
        }

        public async Task<CardListResponse> ListCards(CardListRequest cardListRequest)
        {
            var cardService = default(CardService);
            var cardListResponse = new CardListResponse();
            try
            {
                var customerResult = await FindCustomer(new CustomerRequest { Email = cardListRequest.Email });
                cardService = new CardService();
                var options = new CardListOptions
                {
                    Limit = 20,
                };
                var cards = await cardService.ListAsync(customerResult.Id, options);
                if (cards?.Count() > 0)
                {
                    cardListResponse.Cards = cards.Data;
                    cardListResponse.Success = true;
                }
                return cardListResponse;
            }
            catch (StripeException stripeExcp)
            {
                cardListResponse.Success = false;
                cardListResponse.ErrorMessage = stripeExcp.StripeError.ErrorDescription;
            }
            catch (Exception ex)
            {
                cardListResponse.Success = false;
                cardListResponse.ErrorMessage = ex.Message;
            }
            return cardListResponse;
        }

        public Task<string> GenerateToken(string customerId = null)
        {
            throw new NotImplementedException();
        }

        public async Task<PaymentResponse> ProcessPayment(PaymentRequest paymentRequest)
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = Convert.ToInt64(paymentRequest.Amount * 100),
                Currency = "usd",
                PaymentMethodTypes = new List<string>
                {
                    "card",
                },
                Confirm = true,
                Metadata = new Dictionary<string, string>
                  {
                    { "order_id", paymentRequest.OrderId },
                  },
                Description = paymentRequest.Description
            };
            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);
            return new PaymentResponse();
        }

        public async Task<CreditCardTransactionResponse> ProcessSaleTransactionIntent(ICreditCardTransactionRequest creditCardTransaction)
        {
            PaymentIntent paymentIntent = new PaymentIntent();
            PaymentIntentService intentService = new PaymentIntentService();
            CreditCardTransactionRequest stripeCCTransactionRequest = (CreditCardTransactionRequest)creditCardTransaction;
            PaymentIntentCreateOptions intentCreateOptions = IntentOptions(stripeCCTransactionRequest);
            CreditCardTransactionResponse creditCardTransactionResponse = new CreditCardTransactionResponse();
            if (!string.IsNullOrWhiteSpace(creditCardTransaction.CustomerId))
            {
                var result = await FindCustomer(new CustomerRequest { Email = creditCardTransaction.CustomerId });
                creditCardTransaction.CustomerId = result.Id;
            }

            var metaData = new Dictionary<string, string>
                    {
                        { "OrderId", stripeCCTransactionRequest.OrderId },
                        { "StoreId", stripeCCTransactionRequest.StoreId },
                        {"StoreName", stripeCCTransactionRequest.StoreName },
                        {"StorePhoneNumber", stripeCCTransactionRequest.StorePhoneNumber }
                    };
            intentCreateOptions.Metadata = metaData;

            paymentIntent = await intentService.CreateAsync(intentCreateOptions);
            if (paymentIntent != null && paymentIntent.Status == "succeeded")
            {
                creditCardTransactionResponse = new CreditCardTransactionResponse
                {
                    Amount = paymentIntent.Amount,
                    CustomerId = paymentIntent.CustomerId,
                    Status = paymentIntent.Status,
                    InvoiceId = paymentIntent.InvoiceId
                };
                creditCardTransactionResponse.HasSucceeded = true;
            }
            else
            {
                creditCardTransactionResponse.HasSucceeded = false;
            }

            return creditCardTransactionResponse;
        }

        private PaymentIntentCreateOptions IntentOptions(CreditCardTransactionRequest stripeCCTransactionRequest)
        {
            PaymentIntentCreateOptions createIntentOptions = new PaymentIntentCreateOptions
            {
                Amount = Convert.ToInt64(stripeCCTransactionRequest.Amount * 100),
                CaptureMethod = "manual",
                Confirm = true,
                ConfirmationMethod = "automatic",
                Currency = "USD",
                PaymentMethod = stripeCCTransactionRequest.Token,
                PaymentMethodTypes = new List<string> { "card" },
                Description = $"Swift Serve payment for order {stripeCCTransactionRequest.OrderId}",
                StatementDescriptor = $"Order {stripeCCTransactionRequest.OrderId}"
            };

            if (!string.IsNullOrWhiteSpace(stripeCCTransactionRequest.CustomerId))
            {
                createIntentOptions.Customer = stripeCCTransactionRequest.CustomerId;
            }
            return createIntentOptions;
        }

        public async Task<PaymentIntent> CancelPaymentIntent(string intentId)
        {
            try
            {
                PaymentIntentService service = new PaymentIntentService();
                var response = await service.CancelAsync(intentId);
                return response;
            }
            catch (Exception ex)
            {
                return new PaymentIntent
                {
                    Status = $"Failed: {ex.Message}"
                };
            }
        }

        public async Task<PaymentIntent> RetrievePaymentIntent(string intentId)
        {
            try
            {
                PaymentIntentService service = new PaymentIntentService();
                var response = await service.GetAsync(intentId);
                return response;
            }
            catch (Exception ex)
            {
                return new PaymentIntent
                {
                    Status = $"Failed: {ex.Message}"
                };
            }
        }

        public async Task<CreditCardTransactionResponse> ProcessSaleTransaction(ICreditCardTransactionRequest creditCardTransaction)
        {
            Charge stripeCharge = null;
            ChargeCreateOptions createChargeOptions = null;
            CreditCardTransactionResponse creditCardTransactionResponse = new CreditCardTransactionResponse();
            CreditCardTransactionRequest stripeCCTransactionRequest = (CreditCardTransactionRequest)creditCardTransaction;
            try
            {
                if (!string.IsNullOrWhiteSpace(creditCardTransaction.CustomerId))
                {
                    var result = await FindCustomer(new CustomerRequest { Email = creditCardTransaction.CustomerId });
                    creditCardTransaction.CustomerId = result.Id;
                }

                createChargeOptions = ChargeOptions(stripeCCTransactionRequest);

                //CreateShippingOptions(stripeCCTransactionRequest, createChargeOptions);

                var metaData = new Dictionary<string, string>
                    {
                        { "OrderId", stripeCCTransactionRequest.OrderId },
                        { "StoreId", stripeCCTransactionRequest.StoreId },
                        {"StoreName", stripeCCTransactionRequest.StoreName },
                        {"StorePhoneNumber", stripeCCTransactionRequest.StorePhoneNumber }
                    };
                createChargeOptions.Metadata = metaData;

                var stripeService = new ChargeService();
                stripeCharge = await stripeService.CreateAsync(createChargeOptions);
                if (stripeCharge != null && string.IsNullOrEmpty(stripeCharge.FailureCode))
                {
                    creditCardTransactionResponse = StripeTxnToCCTxnResponse(stripeCharge);
                    creditCardTransactionResponse.HasSucceeded = true;
                }
                else
                {
                    creditCardTransactionResponse.HasSucceeded = false;
                }

            }
            catch (StripeException stripeExcp)
            {
                throw stripeExcp;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return creditCardTransactionResponse;
        }

        public async Task<CreditCardTransactionResponse> UpdateCharge(UpdateChargeRequest updateChargeRequest)
        {
            Charge stripeCharge = null;
            CreditCardTransactionResponse creditCardTransactionResponse = new CreditCardTransactionResponse();
            try
            {
                var options = new ChargeUpdateOptions
                {
                    Metadata = new Dictionary<string, string>
                      {
                        { "OrderId", updateChargeRequest.OrderId },
                        { "StoreId", updateChargeRequest.StoreId },
                      },
                };

                var stripeService = new ChargeService();
                stripeCharge = await stripeService.UpdateAsync(updateChargeRequest.ChargeId, options); ;
                if (stripeCharge != null && string.IsNullOrEmpty(stripeCharge.FailureCode))
                {
                    creditCardTransactionResponse = StripeTxnToCCTxnResponse(stripeCharge);
                    creditCardTransactionResponse.HasSucceeded = true;
                }
                else
                {
                    creditCardTransactionResponse.HasSucceeded = false;
                }

            }
            catch (StripeException stripeExcp)
            {
                creditCardTransactionResponse.HasSucceeded = false;
                throw new Exception($"Unhandled Exception Occurred in Stripe's Charge Processing - {stripeExcp.Message}");
            }
            catch (Exception ex)
            {
                creditCardTransactionResponse.HasSucceeded = false;
                throw new Exception($"Unhandled Exception Occurred in Stripe's Charge Processing - {ex.Message}");
            }

            return creditCardTransactionResponse;
        }

        public Task<CreditCardTransactionResponse> QueueBasedProcessSaleTransaction(ICreditCardTransactionRequest creditCardTransaction)
        {
            throw new NotImplementedException();
        }

        public async Task<CreditCardTransactionResponse> RefundSaleTransaction(RefundCreditCardTransactionRequest refundCreditCardTransactionRequest)
        {
            /*IMP NOTE: Disputes and chargebacks aren’t possible on credit card charges that are fully refunded. Once issued, a refund cannot be canceled.
             * Some refunds—those issued shortly after the original charge—appear in the form of a reversal instead of a refund. 
             * In the case of a reversal, the original charge drops off the customer’s statement, and a separate credit is not issued.             
             */

            CreditCardTransactionResponse creditCardTransactionResponse = new CreditCardTransactionResponse();
            RefundCreateOptions createRefundOptions = null;
            Refund refundResponse = null;

            try
            {
                createRefundOptions = new RefundCreateOptions
                {
                    //Amount = Convert.ToInt64(refundCreditCardTransactionRequest.Amount),

                    Charge = refundCreditCardTransactionRequest.Charge,
                    //ReverseTransfer = refundCreditCardTransactionRequest.ShouldReverseTransfer,
                    //RefundApplicationFee = refundCreditCardTransactionRequest.ShouldRefundApplicationFee,
                    //Reason = refundCreditCardTransactionRequest.RefundReason.ToString(), //TODO: Revisit this for email to RADAR for better Fraud Detection Algo
                    //Metadata = refundCreditCardTransactionRequest.AdditonalInfo
                };

                var refundService = new RefundService();
                refundResponse = await refundService.CreateAsync(createRefundOptions);
                if (refundResponse != null && string.IsNullOrEmpty(refundResponse.FailureReason))
                {
                    creditCardTransactionResponse.RequestPayload = JsonConvert.SerializeObject(createRefundOptions);
                    creditCardTransactionResponse.ResponsePayload = JsonConvert.SerializeObject(refundResponse);
                    creditCardTransactionResponse.HasSucceeded = true;
                }
                else
                {
                    creditCardTransactionResponse.RequestPayload = JsonConvert.SerializeObject(createRefundOptions);
                    creditCardTransactionResponse.ResponsePayload = JsonConvert.SerializeObject(refundResponse);
                    creditCardTransactionResponse.HasSucceeded = false;
                }

            }
            catch (StripeException stripeEx)
            {
                creditCardTransactionResponse.RequestPayload = JsonConvert.SerializeObject(createRefundOptions);
                creditCardTransactionResponse.ResponsePayload = JsonConvert.SerializeObject(refundResponse);
                creditCardTransactionResponse.HasSucceeded = false;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return creditCardTransactionResponse;
        }

        public Task<List<CreditCardTransactionResponse>> RetrieveAllCustomerTransactionDetails(string customerId)
        {
            throw new NotImplementedException();
        }

        public Task<CreditCardTransactionResponse> RetrieveParticularSaleTransactionDetails(string transactionId)
        {
            throw new NotImplementedException();
        }

        public async Task<CreateCustomerResponse> UpdateCustomer(string id, CreateCustomerRequest createCustomerRequest)
        {
            var customerService = new Stripe.CustomerService();
            var data = await customerService.ListAsync(new CustomerListOptions
            {
                Email = createCustomerRequest.Email
            });
            var customer = default(Customer);
            var service = new CardService();
            var card = default(Card);
            if (data.Any() && data.FirstOrDefault() != null)
            {
                customer = data.FirstOrDefault();
                var cardCreateOptions = new CardCreateOptions
                {
                    //SourceToken = createCustomerRequest.Nonce
                };
                card = service.Create(customer.Id, cardCreateOptions);
            }
            else
            {
                customer = customerService.Create(new CustomerCreateOptions
                {
                    Email = createCustomerRequest.Email,
                    //SourceToken = createCustomerRequest.Nonce,
                });
                var cards = await service.ListAsync(customer.Id);
                card = cards.FirstOrDefault();
            }
            if (customer != null && card != null)
            {
                //_logger.LogInfo($"<= Returning Customer Id and Card Id {nameof(StripeConsumerPaymentProvider)} -{MethodBase.GetCurrentMethod().Name}");
                return new CreateCustomerResponse
                {
                    Email = customer.Email,
                    Id = customer.Id,
                    Token = card.Id,
                };
            }
            return null;
        }

        public Task<CreditCardTransactionResponse> VoidSaleTransaction(VoidCreditCardTransactionRequest voidCreditCardTransactionRequest)
        {
            throw new NotImplementedException();
        }


        public async Task<CreditCardTransactionResponse> ProcessCardVerificationTransaction(ICreditCardTransactionRequest creditCardTransaction)
        {
            CreditCardTransactionResponse creditCardTransactionResponse = null;
            try
            {
                // Payment
                creditCardTransactionResponse = await ProcessSaleTransaction(creditCardTransaction);

                // Refund
                var refundCreditCardTransactionRequest = new RefundCreditCardTransactionRequest
                {
                    Charge = creditCardTransactionResponse.Id,
                    Amount = creditCardTransactionResponse.Amount,
                    OrderId = creditCardTransactionResponse.OrderId,
                    RefundReason = EnumRefundReason.requested_by_customer
                };
                var refundResponse = await RefundSaleTransaction(refundCreditCardTransactionRequest);

                creditCardTransactionResponse.RequestPayload = refundResponse.RequestPayload;
                creditCardTransactionResponse.ResponsePayload = refundResponse.ResponsePayload;
                creditCardTransactionResponse.HasSucceeded = refundResponse.HasSucceeded;
            }
            catch (StripeException stripeExcp)
            {
                creditCardTransactionResponse.RequestPayload = JsonConvert.SerializeObject(creditCardTransaction, Formatting.None, new JsonSerializerSettings { ContractResolver = new StripeDuplicateContractResolver() });
                creditCardTransactionResponse.ResponsePayload = JsonConvert.SerializeObject(creditCardTransactionResponse);
                creditCardTransactionResponse.HasSucceeded = false;
                throw new Exception($"Unhandled Exception Occurred in Stripe's Charge Processing - {stripeExcp.Message}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Unhandled Exception Occurred in Stripe's Charge Processing - {ex.Message}");
            }

            return creditCardTransactionResponse;
        }
        public async Task<CreditCardTransactionResponse> CaptureSaleTransaction(CreditCardPaymentCaptureRequest creditCardPaymentCaptureRequest)
        {
            Charge stripeCharge = null;
            ChargeCreateOptions createChargeOptions = null;
            CreditCardTransactionResponse creditCardTransactionResponse = null;
            try
            {
                var stripeService = new ChargeService();
                stripeCharge = await stripeService.CaptureAsync(creditCardPaymentCaptureRequest.ChargeId);
                if (stripeCharge != null && string.IsNullOrEmpty(stripeCharge.FailureCode))
                {
                    creditCardTransactionResponse = StripeTxnToCCTxnResponse(stripeCharge);
                    creditCardTransactionResponse.RequestPayload = JsonConvert.SerializeObject(createChargeOptions, Formatting.None, new JsonSerializerSettings { ContractResolver = new StripeDuplicateContractResolver() });
                    creditCardTransactionResponse.ResponsePayload = JsonConvert.SerializeObject(stripeCharge);
                }
                else
                {
                    creditCardTransactionResponse.RequestPayload = JsonConvert.SerializeObject(createChargeOptions, Formatting.None, new JsonSerializerSettings { ContractResolver = new StripeDuplicateContractResolver() });
                    creditCardTransactionResponse.ResponsePayload = JsonConvert.SerializeObject(stripeCharge);
                    creditCardTransactionResponse.HasSucceeded = false;
                }

            }
            catch (StripeException stripeExcp)
            {
                creditCardTransactionResponse.RequestPayload = JsonConvert.SerializeObject(createChargeOptions, Formatting.None, new JsonSerializerSettings { ContractResolver = new StripeDuplicateContractResolver() });
                creditCardTransactionResponse.ResponsePayload = JsonConvert.SerializeObject(stripeCharge);
                creditCardTransactionResponse.HasSucceeded = false;
                throw new Exception($"Unhandled Exception Occurred in Stripe's Charge Processing - {stripeExcp.Message}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Unhandled Exception Occurred in Stripe's Charge Processing - {ex.Message}");
            }

            return creditCardTransactionResponse;
        }

        #region Helper Methods

        private CreditCardTransactionResponse StripeTxnToCCTxnResponse(Charge stripeCharge)
        {
            var ccTxnResponse = new CreditCardTransactionResponse
            {
                Id = stripeCharge.Id,
                Paid = stripeCharge.Paid,
                PaymentIntentId = stripeCharge.PaymentIntentId,
                ReceiptEmail = stripeCharge.ReceiptEmail,
                ReceiptNumber = stripeCharge.ReceiptNumber,
                ReceiptUrl = stripeCharge.ReceiptUrl,
                OnBehalfOfId = stripeCharge.OnBehalfOfId,
                Refunded = stripeCharge.Refunded,
                ReviewId = stripeCharge.ReviewId,
                SourceTransferId = stripeCharge.SourceTransferId,
                StatementDescriptor = stripeCharge.StatementDescriptor,
                TransferId = stripeCharge.TransferId,
                Livemode = stripeCharge.Livemode,
                ObjectData = stripeCharge.Object,
                Amount = stripeCharge.Amount,
                AmountRefunded = stripeCharge.AmountRefunded,
                ApplicationId = stripeCharge.ApplicationId,
                ApplicationFeeId = stripeCharge.ApplicationFeeId,
                ApplicationFeeAmount = stripeCharge.ApplicationFeeAmount,
                BalanceTransactionId = stripeCharge.BalanceTransactionId,
                Captured = stripeCharge.Captured,
                Created = stripeCharge.Created,
                Currency = stripeCharge.Currency,
                CustomerId = stripeCharge.CustomerId,
                Description = stripeCharge.Description,
                DestinationId = stripeCharge.DestinationId,
                DisputeId = stripeCharge.DisputeId,
                FailureCode = stripeCharge.FailureCode,
                FailureMessage = stripeCharge.FailureMessage,
                InvoiceId = stripeCharge.InvoiceId,
                TransferGroup = stripeCharge.TransferGroup,
                AuthorizationCode = stripeCharge.AuthorizationCode,
                Status = stripeCharge.Status,
                OrderId = stripeCharge.OrderId,
                Brand = stripeCharge.PaymentMethodDetails.Card.Brand,
                Last4 = stripeCharge.PaymentMethodDetails.Card.Last4
            };

            return ccTxnResponse;
        }

        private static ChargeCreateOptions ChargeOptions(CreditCardTransactionRequest stripeCCTransactionRequest)
        {
            ChargeCreateOptions createChargeOptions;
            createChargeOptions = new ChargeCreateOptions
            {
                Amount = Convert.ToInt64(stripeCCTransactionRequest.Amount * 100),//TODO: Sum(unit_cost * quantity + tax_amount - discount_amount) + shipping_amount
                Capture = stripeCCTransactionRequest.IsNativeBooking,
                Currency = "USD",// stripeCCTransactionRequest.RequestedCurrency,
                                 //Customer = stripeCCTransactionRequest.CustomerId,
                Description = $"Swift Serve payment for order {stripeCCTransactionRequest.OrderId}",// stripeCCTransactionRequest.LineItems.FirstOrDefault().Description,
                Source = stripeCCTransactionRequest.Token,
                //TODO: Handle Statement descriptor like this:
                //https://stripe.com/docs/charges- Statement descriptor section
                StatementDescriptor = $"Order {stripeCCTransactionRequest.OrderId}"//stripeCCTransactionRequest.LineItems.FirstOrDefault().Description.Substring(0, 20)
            };

            if (!string.IsNullOrWhiteSpace(stripeCCTransactionRequest.CustomerId))
            {
                createChargeOptions.Customer = stripeCCTransactionRequest.CustomerId;
            }
            return createChargeOptions;
        }

        private static void CreateShippingOptions(CreditCardTransactionRequest creditCardTransaction, ChargeCreateOptions createChargeOptions)
        {
            CreditCardTransactionRequest stripeCCTransactionRequest = (CreditCardTransactionRequest)creditCardTransaction;
            AddressOptions addressOptions = new AddressOptions
            {
                Line1 = creditCardTransaction.Address.StreetAddress,
                Country = creditCardTransaction.Address.CountryName,
                PostalCode = creditCardTransaction.Address.PostalCode,
                State = creditCardTransaction.Address.State,//TODO: MUST be passed from UI
                City = creditCardTransaction.Address.City //TODO:MUST be passed from UI
            };

            createChargeOptions.Shipping = new ChargeShippingOptions
            {
                Address = addressOptions,
                Carrier = "DIGITAL",
                Name = $"{creditCardTransaction.Address.FirstName} {creditCardTransaction.Address.LastName}",
                Phone = creditCardTransaction.Phone,//TODO:MUST be passed from UI
                TrackingNumber = creditCardTransaction.OrderId
            };
        }

        private static void CreateLevel3TransactionDetails(CreditCardTransactionRequest creditCardTransaction, ChargeCreateOptions createChargeOptions)
        {
            List<ChargeLevel3LineItemOptions> itemRequests = new List<ChargeLevel3LineItemOptions>();
            foreach (var lineItem in creditCardTransaction.LineItems)
            {
                ChargeLevel3LineItemOptions chargeLevel3LineItemOptions = new ChargeLevel3LineItemOptions
                {
                    UnitCost = Convert.ToInt64(lineItem.UnitAmount),
                    TaxAmount = Convert.ToInt64(lineItem.UnitTaxAmount),
                    Quantity = Convert.ToInt64(lineItem.Quantity),
                    ProductCode = lineItem.ProductCode,
                    ProductDescription = lineItem.CommodityCode, //Replace with Strip commodity code
                    DiscountAmount = Convert.ToInt64(lineItem.DiscountAmount),
                };

                itemRequests.Add(chargeLevel3LineItemOptions);
            }

            createChargeOptions.Level3 = new ChargeLevel3Options
            {
                LineItems = itemRequests,
                ShippingAmount = 0,
                ShippingFromZip = creditCardTransaction.ShippingPostal, //SwiftServe Zip code from config
                ShippingAddressZip = creditCardTransaction.Address.PostalCode,
                MerchantReference = "www.SwiftServe.com",
                CustomerReference = creditCardTransaction.CustomerId
            };
        }

        private CardResponse PrepareCardResponse(Card cardResp)
        {
            return new CardResponse
            {
                AddressLine1 = cardResp.AddressLine1,
                AddressLine2 = cardResp.AddressLine2,
                AddressState = cardResp.AddressState,
                AddressZip = cardResp.AddressZip,
                Brand = cardResp.Brand,
                Country = cardResp.Country,
                Currency = cardResp.Currency,
                CustomerId = cardResp.CustomerId,
                CvcCheck = cardResp.CvcCheck,
                DefaultForCurrency = cardResp.DefaultForCurrency,
                Deleted = cardResp.Deleted,
                Description = cardResp.Description,
                DynamicLast4 = cardResp.DynamicLast4,
                ExpMonth = cardResp.ExpMonth,
                ExpYear = cardResp.ExpYear,
                Id = cardResp.Id,
                Issuer = cardResp.Issuer,
                Last4 = cardResp.Last4,
                Name = cardResp.Name,
                Success = true
            };
        }
        #endregion
    }
}
