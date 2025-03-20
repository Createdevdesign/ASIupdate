using AutoMapper;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Taxjar;

using System.Text.RegularExpressions;

using Amazon.Runtime;
using Amazon.SQS;
using Amazon.SQS.Model;
using Newtonsoft.Json;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Entities.Discounts;
using order_placement_service.Entities.Taxes;
using order_placement_service.Entities.Orders;
using order_placement_service.Entities.Customers;
using order_placement_service.Entities.Countries;
using order_placement_service.Common;
using order_placement_service.Entities.Currencies;
using order_placement_service.Repository.Interfaces.FrameworkService;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Entities.FavoriteStores;
using order_placement_service.Entities.QiCodes;
using order_placement_service.Model.OrderFacade.Order;
using order_placement_service.Entities.Payments;
using order_placement_service.Enums;
using order_placement_service.ExternalDataAccess.Models;
using order_placement_service.Entities.Stores;
using order_placement_service.Model.NotificationFacade.Email;
using order_placement_service.Model;
using order_placement_service.Model.Consumerpayment;
using order_placement_service.Model.NotificationFacade;
using order_placement_service.Model.OrderFacade;
using SwiftServe.OrderService.WebApi.Enums;
using order_placement_service.ExternalDataAccess;

namespace order_placement_service.Repository.Implementation
{
    public class OrderService : Interfaces.IOrderService
    {
        private readonly IRepository<Entities.Customers.Customer> _customerRepository;
        private readonly IRepository<Entities.Orders.Order> _orderRepository;
        private readonly IConsumerPaymentProvider _paymentService;
        private readonly IRepository<Entities.Discounts.Discount> _discountRepository;
        private readonly IRepository<Entities.Products.Product> _productRepository;
        private readonly IRepository<DiscountUsageHistory> _discountHistoryRepository;
        private readonly IRepository<DiscountCoupon> _discountCouponRepository;
        private readonly IRepository<Entities.Taxes.TaxRate> _taxRateRepository;
        private readonly IRepository<TaxCategory> _taxCategoryRepository;
        private readonly IRepository<OrderNote> _orderNoteRepository;
        private readonly IRepository<StateProvince> _stateProvinceRepository;
        private readonly IRepository<Country> _countryRepository;
        private readonly WebHelper _webHelper;
        private readonly IRepository<Entities.Products.ProductAttribute> _productAttributeRepository;
        private readonly IRepository<Currency> _currencyRepository;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly AppSettings _appSettings;
        private readonly TaxjarApi _taxjarApiClient;
        private readonly IRepository<order_placement_service.Entities.Stores.Store> _storerepository;
        private readonly IRepository<Country> _countryrepository;
        private readonly IRepository<QiCodes> _qicrepository;
        private readonly IEmailService _emailService;
        private IExternalDataRepository _externalRepository;


        public OrderService(
            WebHelper webHelper,
            IRepository<Entities.Discounts.Discount> discountRepository,
            IRepository<OrderNote> orderNoteRepository,
            IRepository<Entities.Taxes.TaxRate> taxRateRepository,
            IRepository<TaxCategory> taxCategoryRepository,
            IRepository<DiscountCoupon> discountCouponRepository,
            IRepository<DiscountUsageHistory> discountHistoryRepository,
            IRepository<StateProvince> stateProvinceRepository,
            IRepository<Country> countryRepository,
            IRepository<Entities.Products.Product> productRepository,
            IRepository<order_placement_service.Entities.Stores.Store> storerepository,
            IRepository<Country> countryrepository,
            IRepository<Entities.Customers.Customer> customerService,
            IRepository<Entities.Orders.Order> orderRepository,
            IConsumerPaymentProvider paymentService,
            IRepository<Entities.Products.ProductAttribute> productAttributeRepository,
            IRepository<Currency> currecnyRepository,
            INotificationService notificationService,
            IMapper mapper,
            IOptions<AppSettings> appSettings,
            IEmailService emailService,
            IRepository<QiCodes> qicrepository
            )
        {
            _webHelper = webHelper;
            _discountRepository = discountRepository;
            _taxRateRepository = taxRateRepository;
            _taxCategoryRepository = taxCategoryRepository;
            _discountCouponRepository = discountCouponRepository;
            _discountHistoryRepository = discountHistoryRepository;
            _productRepository = productRepository;
            _storerepository = storerepository;
            _countryrepository = countryrepository;
            _appSettings = appSettings.Value;
            _customerRepository = customerService;
            _paymentService = paymentService;
            _orderRepository = orderRepository;
            _orderNoteRepository = orderNoteRepository;
            _productAttributeRepository = productAttributeRepository;
            _currencyRepository = currecnyRepository;
            _notificationService = notificationService;
            _emailService = emailService;
            _mapper = mapper;
            _qicrepository = qicrepository;
            _stateProvinceRepository = stateProvinceRepository;
            _countryrepository = countryRepository;
            _taxjarApiClient = new TaxjarApi(_appSettings.TaxJar.TaxJarLicensekey);
        }

        public async Task<PlaceOrderResultDto> PlaceOrder(ProcessPaymentRequest processPaymentRequest)
        {
            string cloverOrderId = string.Empty;
            if (processPaymentRequest == null)
                throw new ArgumentNullException("processPaymentRequest");

            var result = new PlaceOrderResult();
            ProcessPaymentResult processPaymentResult = new ProcessPaymentResult();
            PaymentIntent intentOutput = new PaymentIntent();
            Entities.Orders.Order order = new Entities.Orders.Order();
            try
            {
                if (!string.IsNullOrWhiteSpace(processPaymentRequest.PaymentIntentId))
                {
                    intentOutput = await _paymentService.RetrievePaymentIntent(processPaymentRequest.PaymentIntentId);
                    if (intentOutput == null)
                        return new PlaceOrderResultDto { Errors = new List<string> { "No Payment intent found!" } };

                    if (!intentOutput.Status.Equals("succeeded") && !intentOutput.Status.Equals("requires_capture"))
                    {
                        return new PlaceOrderResultDto { Errors = new List<string> { $"Incorrect payment intent status returned {intentOutput.Status}" } };
                    }
                }

                if (processPaymentRequest.OrderGuid == Guid.Empty)
                    processPaymentRequest.OrderGuid = Guid.NewGuid();

                var details = await PreparePlaceOrderDetails(processPaymentRequest);

                //Get calculated price
                var payRequest = new CalculateTotalsRequestDto
                {
                    PromotionId = processPaymentRequest.PromotionId,
                    PromoCode = processPaymentRequest.PromoCode,
                    StoreId = processPaymentRequest.StoreId,
                    Username = processPaymentRequest.UserName,
                    AddressId = processPaymentRequest.AddressId,
                    OrderType = processPaymentRequest.OrderType,
                    SelectedTime = processPaymentRequest.SelectedTime,
                    IsTaxRequired = true
                };
                var totalsResponse = await this.CalculateTotals(payRequest, true);
                totalsResponse.TotalAmount = totalsResponse.TotalAmount + processPaymentRequest.TipAmount;
                if ((decimal)intentOutput.AmountReceived != 0)
                {
                    if (intentOutput.Status.Equals("succeeded") && totalsResponse.TotalAmount != (decimal)intentOutput.AmountReceived / 100)
                        return new PlaceOrderResultDto { Errors = new List<string> { "Payment succeeded but not equal to the total amount per Swiftserve." } };
                    else if (intentOutput.Status.Equals("requires_capture") && totalsResponse.TotalAmount != (decimal)intentOutput.AmountCapturable / 100)
                        return new PlaceOrderResultDto { Errors = new List<string> { "Payment status requires_capture but not equal to the total amount per Swiftserve." } };
                }
                if (totalsResponse is null || !totalsResponse.Status)
                    return new PlaceOrderResultDto { Errors = new List<string> { totalsResponse.Message } };

                if (!totalsResponse.Status && !string.IsNullOrWhiteSpace(totalsResponse.PromoCodeMessage))
                    return new PlaceOrderResultDto { Errors = new List<string> { totalsResponse.PromoCodeMessage } };

                var qrCode = string.IsNullOrWhiteSpace(processPaymentRequest.ExtId) ? new QiCodes() : _qicrepository.Table.Where(a => a.ExtId.Equals(processPaymentRequest.ExtId)).FirstOrDefault();

                if (!processPaymentRequest.PayAtStore)
                {
                    order = PrepareOrder(processPaymentRequest, processPaymentResult, details, totalsResponse, qrCode, intentOutput);
                    result.PlacedOrder = await SaveOrderDetails(details, order);
                }
                else if (processPaymentRequest.PayAtStore)
                {
                    //Scenario for Pay at Store
                    processPaymentResult.NewPaymentStatus = PaymentStatus.PayAtStore;
                    processPaymentResult.PaymentType = "PAY-AT-STORE";
                    order = PrepareOrder(processPaymentRequest, processPaymentResult, details, totalsResponse, qrCode, intentOutput);
                    result.PlacedOrder = await SaveOrderDetails(details, order);
                }
                //Save Order to Clover Details
                var store = _storerepository.Table.Where(x => x.Id.Equals(processPaymentRequest.StoreId)).FirstOrDefault();

                if (store.ThirdPartyConfig != null && !string.IsNullOrEmpty(store.ThirdPartyConfig.MerchantId))
                {
                    CloverOrderDto orderDto = new CloverOrderDto();
                    orderDto.credential.AccessToken = store.ThirdPartyConfig.AccessToken;
                    orderDto.credential.BaseUrl = store.ThirdPartyConfig.BaseUrl;
                    orderDto.credential.MerchantId = store.ThirdPartyConfig.MerchantId;
                    List<LineItemDto> lineItems = new List<LineItemDto>();
                    foreach (var item in result.PlacedOrder.OrderItems)
                    {
                        var product = _productRepository.Table.Where(predicate: a => a.Id.Equals(item.ProductId)).FirstOrDefaultAsync().Result;
                        var lineItem = new LineItemDto { LineItemId = product.ExternalId, Quantity = item.Quantity, Note = item.AdditionalComments };
                        var ordersAttributes = ParseProductAttributesFromXml(item.AttributesXml, product).Result;
                        foreach (var attr in ordersAttributes)
                        {
                            foreach (var modifier in attr.ProductAttributeValues)
                            {
                                lineItem.Modifiers.Add(new ModifierDto { ModifierId = modifier.ExternalAttributeId });
                            }
                        }
                        lineItems.Add(lineItem);
                    }
                    orderDto.LineItems = lineItems;
                    _externalRepository = new CloverDataRepository();

                    string orderNote = (qrCode == null || string.IsNullOrWhiteSpace(qrCode.DisplayText)) ? $"#Customer: {result.PlacedOrder.FirstName} {result.PlacedOrder.LastName} #Phone: {processPaymentRequest.UserName} #OrderNotes: {result.PlacedOrder.OrderComment} #OrderType: {order.DeliveryType}" : $"#Customer: {result.PlacedOrder.FirstName} {result.PlacedOrder.LastName} #Phone: {processPaymentRequest.UserName} #OrderNotes: {result.PlacedOrder.OrderComment}  #OrderType: {order.DeliveryType} #QRCode: {qrCode.DisplayText}";
                    orderNote = (order.DeliveryAddress != null) ? orderNote + GetDeliveryAddressString(order.DeliveryAddress) : orderNote;
                    orderNote = (string.IsNullOrWhiteSpace(order.DeliveryTime)) ? string.Empty : $" #Pickup/Delivery time: {order.DeliveryTime}";

                    ExternalOrderRequestDto requestDto = new ExternalOrderRequestDto
                    {
                        note = orderNote,
                        title = $"SwiftServe Order: {result.PlacedOrder.OrderNumber.ToString()}",//This will be shown in OrderNumber under Clover Order Detail
                        paymentState = (result.PlacedOrder.PaymentStatus == PaymentStatus.PayAtStore) ? "OPEN" : "PAID",
                        status = "Open",
                        taxRemoved = true,
                        total = result.PlacedOrder.OrderTotal * 100 + result.PlacedOrder.OrderTax * 100 + result.PlacedOrder.TipAmount * 100, //total Order amount is considered in Cents
                        externalReferenceId = result.PlacedOrder.OrderNumber.ToString(),
                        customers = new List<ExternalDataAccess.Models.Customer>
                        {
                            new ExternalDataAccess.Models.Customer
                            {
                                firstName = result.PlacedOrder.FirstName,
                                lastName = result.PlacedOrder.LastName,
                                phoneNumbers = new List<PhoneNumbers>
                                {
                                    new PhoneNumbers
                                    {
                                        //Username is Phone Number in SwiftServe
                                         phoneNumber = details.Customer.Username
                                    }
                                },
                                emailAddresses = new List<EmailAddresses>
                                {
                                   new EmailAddresses
                                   {
                                       emailAddress = result.PlacedOrder.CustomerEmail
                                   }
                                }
                            }
                        },
                        lineItems = new List<LineItems>
                        {
                            new LineItems
                            {
                                alternateName = "Tax from SwiftServe",
                                name = "SwiftServe Tax Amount",
                                price = result.PlacedOrder.OrderTax * 100,
                                exchanged = false,
                                isRevenue = false,
                                printed = false,
                                refund = new ExternalDataAccess.Models.Refund
                                {
                                    transactionInfo = new TransactionInfo
                                    {
                                        emergencyFlag = false,
                                        isTokenBasedTx = false
                                    }
                                },
                                refunded = false
                            },
                            new LineItems
                            {
                                alternateName = "Tip from SwiftServe",
                                name = "SwiftServe Tip Amount",
                                price = result.PlacedOrder.TipAmount * 100,
                                exchanged = false,
                                isRevenue = false,
                                printed = false,
                                refund = new ExternalDataAccess.Models.Refund
                                {
                                    transactionInfo = new TransactionInfo
                                    {
                                        emergencyFlag = false,
                                        isTokenBasedTx = false
                                    }
                                },
                                refunded = false
                            },
                            new LineItems
                            {
                                alternateName = "Delivery fees from SwiftServe",
                                name = "SwiftServe Delivery fees",
                                price = result.PlacedOrder.DeliveryFees * 100,
                                exchanged = false,
                                isRevenue = false,
                                printed = false,
                                refund = new ExternalDataAccess.Models.Refund
                                {
                                    transactionInfo = new TransactionInfo
                                    {
                                        emergencyFlag = false,
                                        isTokenBasedTx = false
                                    }
                                },
                                refunded = false
                            }
                        }
                    };

                    cloverOrderId = _externalRepository.SaveOrder(orderDto, requestDto);
                    result.PlacedOrder.ExternalOrderId = cloverOrderId;
                    await _orderRepository.UpdateAsync(result.PlacedOrder);
                }


                //clear shopping cart
                if (details.Cart.Count > 0)
                    await this.ClearShoppingCartItem(order.CustomerId, details.Cart);

                // Send Notification
                #region Notifications & notes

                await SendNotification(order, processPaymentRequest.UserName, processPaymentRequest.StoreId, (qrCode != null) ? qrCode.ExtId : string.Empty, processPaymentRequest.OrderComment, processPaymentRequest.PayAtStore);

                #endregion
            }
            catch (Exception exc)
            {
                await _paymentService.CancelPaymentIntent(processPaymentRequest.PaymentIntentId);
                if (result.PlacedOrder != null && string.IsNullOrWhiteSpace(result.PlacedOrder.Id))
                {
                    var orderentity = await _orderRepository.Table.FirstOrDefaultAsync(x => x.Id == result.PlacedOrder.Id);
                    await _orderRepository.DeleteAsync(orderentity);
                }

                return new PlaceOrderResultDto { Errors = new List<string> { exc.Message } };
            }

            var response = _mapper.Map<PlaceOrderResult, PlaceOrderResultDto>(result);
            response.PlacedOrder.PaymentStatus = Enum.GetName(typeof(PaymentStatus), string.IsNullOrWhiteSpace(processPaymentRequest.PaymentIntentId) ? PaymentStatus.Authorized : PaymentStatus.Pending);
            SendMessageToSQSQueue(result);
            return response;
        }

        private void SendMessageToSQSQueue(PlaceOrderResult resultDto)
        {
            try
            {
                AWSCredentials creds = new BasicAWSCredentials("AKIAS4GFIADIXG6H7AW5", "Ba8Ao7IH1U4tqa00AaTc834uheSAQv8gYNPR3oE+");
                var client = new AmazonSQSClient(creds);
                var messageRequest = new SendMessageRequest
                {
                    MessageAttributes = new Dictionary<string, MessageAttributeValue>
                {
                    {
                        "OrderId", new MessageAttributeValue
                        { DataType = "String", StringValue = resultDto.PlacedOrder.Id.ToString() }
                    }
                },
                    MessageBody = JsonConvert.SerializeObject(resultDto.PlacedOrder),
                    QueueUrl = "https://sqs.us-east-2.amazonaws.com/197982159057/new-order-queue-dev.fifo",
                    MessageGroupId = Guid.NewGuid().ToString()
                };

                var messageResponse = client.SendMessageAsync(messageRequest).Result;
            }
            catch (Exception ex) { }
        }

        private string GetDeliveryAddressString(Entities.Common.Address deliveryAddress)
        {
            StringBuilder address = new StringBuilder();
            address.Append("#DeliveryAddress: ");
            address.Append(deliveryAddress.Address1);
            address.Append(", ");
            address.Append(deliveryAddress.Address2);
            address.Append(", ");
            address.Append(deliveryAddress.City);
            address.Append(", ");
            if (!string.IsNullOrWhiteSpace(deliveryAddress.StateProvinceId))
                address.Append(_stateProvinceRepository.Table.Where(x => x.Id.Equals(deliveryAddress.StateProvinceId)).Select(y => y.Name));

            address.Append(", ");
            if (!string.IsNullOrWhiteSpace(deliveryAddress.CountryId))
                address.Append(_countryRepository.Table.Where(x => x.Id.Equals(deliveryAddress.CountryId)).Select(y => y.Name));

            address.Append(", ");
            address.Append(deliveryAddress.ZipPostalCode);
            return address.ToString();
        }

        protected virtual async Task<PlaceOrderContainter> PreparePlaceOrderDetails(ProcessPaymentRequest processPaymentRequest, Entities.Customers.Customer customer = null)
        {
            PlaceOrderContainter details = new PlaceOrderContainter();

            //customer
            details.Customer = customer == null ? await _customerRepository.Table.Where(a => a.Username.Equals(processPaymentRequest.UserName)).SingleOrDefaultAsync() : customer;
            if (details.Customer == null)
                throw new ArgumentException("Customer is not set");

            //customer currency
            var currency = await _currencyRepository.Table.Where(x => x.Stores.Contains(processPaymentRequest.StoreId)).SingleOrDefaultAsync();
            details.CustomerCurrencyCode = (currency != null) ? currency.CurrencyCode : "USD";
            details.CustomerCurrencyRate = 1;
            details.PrimaryCurrencyCode = (currency != null) ? currency.CurrencyCode : "USD";

            //load and validate customer shopping cart
            // customer is being sent from the StorePlaceOrder so if it's available means no cart is present so saving one trip to DB.
            details.Cart = customer != null ? null : details.Customer.ShoppingCartItems.Where(a => a.StoreId == processPaymentRequest.StoreId).ToList();

            return details;
        }

        protected virtual async Task<ProcessPaymentResult> PrepareProcessPaymentResult(ProcessPaymentRequest processPaymentRequest, PlaceOrderContainter details, CalculateTotalsResponseDto payResponse)
        {
            ProcessPaymentResult processPaymentResult = null;
            if (details.OrderTotal == decimal.Zero)
            {
                processPaymentResult = new ProcessPaymentResult();

                try
                {
                    //Add logic here for our Payment Service
                    CreditCardTransactionRequest paymentRequest = new CreditCardTransactionRequest();
                    paymentRequest.CustomerId = processPaymentRequest.CustomerId;
                    paymentRequest.Token = processPaymentRequest.Token;
                    paymentRequest.Amount = payResponse.TotalAmount;
                    paymentRequest.TaxAmount = payResponse.TaxAmount;
                    paymentRequest.StoreName = await _storerepository.Table.Where(a => a.Id.Equals(paymentRequest.StoreId)).Select(b => b.Name).FirstOrDefaultAsync();
                    paymentRequest.StorePhoneNumber = await _storerepository.Table.Where(a => a.Id.Equals(paymentRequest.StoreId)).Select(b => b.CompanyPhoneNumber).FirstOrDefaultAsync();

                    var paymentResult = await _paymentService.ProcessSaleTransactionIntent(paymentRequest);
                    processPaymentResult = new ProcessPaymentResult();
                    processPaymentResult.ChargeId = paymentResult.Id;
                    processPaymentResult.NewPaymentStatus = paymentResult.HasSucceeded ? PaymentStatus.Authorized : PaymentStatus.Pending;
                    processPaymentResult.OrderCardBrand = paymentResult.Brand;
                    processPaymentResult.OrderCardLast4Digits = paymentResult.Last4;
                }
                catch (Exception ex)
                {
                    throw new Exception($"Payment failed : {ex.Message}");
                }
            }

            return processPaymentResult;
        }

        protected virtual Entities.Orders.Order PrepareOrder(ProcessPaymentRequest processPaymentRequest, ProcessPaymentResult processPaymentResult, PlaceOrderContainter details, CalculateTotalsResponseDto totalsResponseDto, QiCodes qrCode, PaymentIntent paymentIntent)
        {
            string deliveryType = string.Empty;
            string name = details.Customer.GenericAttributes.Where(a => a.Key.Equals("FirstName")).Select(b => b.Value).FirstOrDefault();
            Entities.Common.Address deliveryAddress = null;

            if (processPaymentRequest.OrderType.ToUpper().Equals("PICKUP"))
            {
                deliveryType = "PICKUP";
                details.PickUpInStore = true;
            }
            else if (processPaymentRequest.OrderType.ToUpper().Equals("DELIVERY"))
                deliveryType = "DELIVERY";
            else if (processPaymentRequest.OrderType.ToUpper().Equals("PICK-UP-CURBSIDE"))
                deliveryType = "PICK-UP-CURBSIDE";
            else
                deliveryType = "DINE-IN";

            if (!string.IsNullOrWhiteSpace(processPaymentRequest.AddressId))
            {
                var addresses = _customerRepository.Table.Where(x => x.Username.Equals(processPaymentRequest.UserName)).Select(a => a.Addresses).ToList();
                var address = addresses.Select(x => x.Where(a => a.Id.Equals(processPaymentRequest.AddressId)).ToList()).FirstOrDefault();
                deliveryAddress = address.Where(a => a.Id.Equals(processPaymentRequest.AddressId)).FirstOrDefault();
            }

            var order = new Entities.Orders.Order
            {
                PaymentType = processPaymentResult.PaymentType,
                StoreId = processPaymentRequest.StoreId,
                OrderGuid = processPaymentRequest.OrderGuid,
                Code = processPaymentRequest.OrderCode,
                CustomerId = details.Customer.Id,
                OwnerId = string.IsNullOrEmpty(details.Customer.OwnerId) ? details.Customer.Id : details.Customer.OwnerId,
                CustomerTaxDisplayType = details.CustomerTaxDisplayType,
                OrderSubtotalInclTax = Math.Round(totalsResponseDto.SubTotalAmount, 6),
                OrderSubtotalExclTax = Math.Round(details.OrderShippingTotalExclTax, 6),
                OrderSubTotalDiscountInclTax = Math.Round(details.OrderSubTotalDiscountInclTax, 6),
                OrderSubTotalDiscountExclTax = Math.Round(totalsResponseDto.PromoCodeAmount, 6),
                OrderShippingInclTax = Math.Round(details.OrderShippingTotalInclTax, 6),
                OrderShippingExclTax = Math.Round(details.OrderShippingTotalExclTax, 6),
                PaymentMethodAdditionalFeeInclTax = Math.Round(details.PaymentAdditionalFeeInclTax, 6),
                PaymentMethodAdditionalFeeExclTax = Math.Round(details.PaymentAdditionalFeeExclTax, 6),
                TaxRates = details.TaxRates,
                OrderTax = Math.Round(totalsResponseDto.TaxAmount, 6),
                OrderTotal = Math.Round(totalsResponseDto.TotalAmount, 6),
                RefundedAmount = decimal.Zero,
                OrderDiscount = Math.Round(totalsResponseDto.PromoCodeAmount, 6),
                CheckoutAttributeDescription = details.CheckoutAttributeDescription,
                CheckoutAttributesXml = details.CheckoutAttributesXml,
                CustomerCurrencyCode = details.CustomerCurrencyCode,
                PrimaryCurrencyCode = details.PrimaryCurrencyCode,
                CurrencyRate = details.CustomerCurrencyRate,
                AffiliateId = details.AffiliateId,
                OrderStatus = OrderStatus.Created,
                AllowStoringCreditCardNumber = processPaymentResult.AllowStoringCreditCardNumber,
                AuthorizationTransactionId = processPaymentResult.AuthorizationTransactionId,
                AuthorizationTransactionCode = processPaymentResult.AuthorizationTransactionCode,
                AuthorizationTransactionResult = processPaymentResult.AuthorizationTransactionResult,
                CaptureTransactionId = processPaymentResult.CaptureTransactionId,
                CaptureTransactionResult = processPaymentResult.CaptureTransactionResult,
                SubscriptionTransactionId = processPaymentResult.SubscriptionTransactionId,
                PaymentStatus = PaymentStatus.Authorized, //processPaymentResult.NewPaymentStatus,
                PaidDateUtc = null,
                BillingAddress = details.BillingAddress,
                ShippingAddress = details.ShippingAddress,
                ShippingStatus = details.ShippingStatus,
                ShippingMethod = details.ShippingMethodName,
                PickUpInStore = details.PickUpInStore,
                PickupPoint = details.PickupPoint,
                ShippingRateComputationMethodSystemName = details.ShippingRateComputationMethodSystemName,
                FirstName = string.IsNullOrWhiteSpace(name) ? details.Customer.DisplayName : name,
                LastName = details.Customer.GenericAttributes.Where(a => a.Key.Equals("LastName")).Select(b => b.Value).FirstOrDefault(),
                CustomerEmail = details.Customer.Email,
                CreatedOnUtc = DateTime.UtcNow,
                StripePaymentId = processPaymentResult.ChargeId,
                TipAmount = processPaymentRequest.TipAmount,
                QRCodeDetails = qrCode == null ? null : new QRCodeDetails { ExtId = qrCode.ExtId, DisplayText = qrCode.DisplayText, Metadata = qrCode.Metadata, StoreId = qrCode.StoreId, Type = qrCode.Type },
                OrderComment = processPaymentRequest.OrderComment,
                DeliveryType = deliveryType,
                DeliveryTime = processPaymentRequest.SelectedTime,
                DeliveryFees = totalsResponseDto.DeliveryFees,
                DeliveryAddress = deliveryAddress,
                AdditionalOrderDetails = GetAdditionalOrderDetails(details, processPaymentRequest, paymentIntent),

            };

            return order;
        }

        private AdditionalOrderDetails GetAdditionalOrderDetails(PlaceOrderContainter details, ProcessPaymentRequest processPaymentRequest, PaymentIntent paymentIntent)
        {
            AdditionalOrderDetails additionalOrderDetails = new AdditionalOrderDetails();
            var store = _storerepository.Table.Where(x => x.Id.Equals(processPaymentRequest.StoreId)).FirstOrDefault();
            var customer = _customerRepository.Table.Where(x => x.Username.Equals(processPaymentRequest.UserName)).FirstOrDefault();
            var products = _productRepository.Table.Where(x => x.Stores.Contains(processPaymentRequest.StoreId)).ToList();

            List<ShoppingCartItem> shoppingCartItems = (details.Cart == null || details.Cart.Count == 0) ? customer.ShoppingCartItems.Where(a => a.StoreId == processPaymentRequest.StoreId).ToList() : details.Cart.ToList();
            var productIds = shoppingCartItems.Select(a => a.ProductId).Distinct().ToList();
            var product = _productRepository.Table.Where(a => productIds.Contains(a.Id)).ToList();

            List<OrderItems> items = new List<OrderItems>();
            foreach (var item in details.Cart)
            {
                items.Add(GetOrderItemsAttribute(item.AttributesXml, product.Where(a => a.Id.Equals(item.ProductId)).FirstOrDefault(), item.Quantity).Result);
            }

            additionalOrderDetails.StoreAddress = store.CompanyAddress;
            additionalOrderDetails.StoreName = store.Name;
            additionalOrderDetails.StorePhoneNumber = store.CompanyPhoneNumber;
            additionalOrderDetails.EmailAddress = customer.Email;
            additionalOrderDetails.PhoneNumber = processPaymentRequest.PhoneNumber;
            additionalOrderDetails.OrderItems = items;
            //New properties added on 30/7/2021
            additionalOrderDetails.GeoLat = processPaymentRequest.GeoLat;
            additionalOrderDetails.GeoLong = processPaymentRequest.GeoLong;
            additionalOrderDetails.UserAgent = processPaymentRequest.UserAgent;
            additionalOrderDetails.IpAddress = processPaymentRequest.IpAddress;
            additionalOrderDetails.OrderCardBrand = paymentIntent.Charges == null ? string.Empty : paymentIntent.Charges.Data[0].PaymentMethodDetails.Card.Brand;
            additionalOrderDetails.OrderCardLast4Digits = paymentIntent.Charges == null ? string.Empty : paymentIntent.Charges.Data[0].PaymentMethodDetails.Card.Last4;
            additionalOrderDetails.PaymentMethodType = processPaymentRequest.PaymentMethodType;

            return additionalOrderDetails;
        }

        public async Task<OrderItems> GetOrderItemsAttribute(string xmlToParse, Entities.Products.Product product, int quantity)
        {
            OrderItems orderItems = null;
            if (!string.IsNullOrWhiteSpace(xmlToParse))
            {
                var attributes = await _webHelper.Deserialize<Model.CartFacade.Attributes>(xmlToParse);
                var items = (from prodAttr in product.ProductAttributeMappings
                             join attr in attributes.ProductAttribute
                             on prodAttr.Id equals attr.ID
                             join addAttr in await _productAttributeRepository.Table.ToListAsync()
                             on prodAttr.ProductAttributeId equals addAttr.Id
                             select (from value in prodAttr.ProductAttributeValues
                                     join attrValue in attr.ProductAttributeValue
                                     on value.Id equals attrValue.Value
                                     //select value.Name).ToList()
                                     select new ProductAttributes
                                     {
                                         AttributeId = value.Id,
                                         Name = value.Name
                                     }).ToList()
                             ).FirstOrDefault();

                orderItems = new OrderItems
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ItemAmount = product.Price,
                    Quantity = quantity,
                    Attributes = items
                };
            }

            return orderItems;
        }

        protected virtual async Task<Entities.Orders.Order> SaveOrderDetails(PlaceOrderContainter details, Entities.Orders.Order order)
        {
            //move shopping cart items to order items
            foreach (var sc in details.Cart)
            {
                //save order item
                var orderItem = new Entities.Orders.OrderItem
                {
                    OrderItemGuid = Guid.NewGuid(),
                    ProductId = sc.ProductId,
                    AttributesXml = sc.AttributesXml,
                    Quantity = sc.Quantity,
                    DownloadCount = 0,
                    IsDownloadActivated = false,
                    LicenseDownloadId = "",
                    RentalStartDateUtc = sc.RentalStartDateUtc,
                    RentalEndDateUtc = sc.RentalEndDateUtc,
                    CreatedOnUtc = DateTime.UtcNow,
                    AdditionalComments = string.IsNullOrWhiteSpace(sc.AdditionalComments) ? string.Empty : sc.AdditionalComments
                };

                string reservationInfo = "";

                if (!string.IsNullOrEmpty(reservationInfo))
                {
                    if (!string.IsNullOrEmpty(orderItem.AttributeDescription))
                    {
                        orderItem.AttributeDescription += "<br>" + reservationInfo;
                    }
                    else
                    {
                        orderItem.AttributeDescription = reservationInfo;
                    }
                }

                order.OrderItems.Add(orderItem);
            }

            //insert order
            await InsertOrder(order);

            return order;
        }

        public virtual async Task SendNotification(Entities.Orders.Order order, string userName, string storeId, string extId, string orderComments, bool isPayAtStore = false)
        {
            // Send the notification as per user preferences

            await _notificationService.SendNotification(new NotificationRequestDto { OrderNumber = order.OrderNumber, Username = userName, StoreId = storeId, isPayAtStore = isPayAtStore, ExtId = extId, OrderComments = orderComments });

            await InsertOrderNote(new OrderNote
            {
                Note = "Order placed",
                DisplayToCustomer = false,
                CreatedOnUtc = DateTime.UtcNow,
                OrderId = order.Id,

            });
        }

        public async Task<CalculateStoreTotalsResponseDto> CalculateStoreTotals(CalculateStoreTotalsRequestDto requestDto)
        {
            CalculateStoreTotalsResponseDto response = new CalculateStoreTotalsResponseDto();

            if (requestDto.Products.Count == 0 || requestDto.Products == null)
                return new CalculateStoreTotalsResponseDto { Status = false, Message = "No products available in request" };

            CalculateTotalsResponseDto responseDto = new CalculateTotalsResponseDto();
            List<ShoppingCartItemDto> shoppingCartItemDto = new List<ShoppingCartItemDto>();

            var productIds = requestDto.Products.Select(a => a.ProductId).Distinct().ToList();
            var products = await _productRepository.Table.Where(x => productIds.Contains(x.Id)).ToListAsync();

            shoppingCartItemDto = (from pd in products
                                   join sc in requestDto.Products
                                   on pd.Id equals sc.ProductId
                                   select new ShoppingCartItemDto
                                   {
                                       Id = sc.ProductId,
                                       Name = pd.Name,
                                       Price = pd.Price,
                                       TotalProductPrice = pd.Price * sc.Quantity,
                                       Quantity = sc.Quantity,
                                       ShoppingCartType = sc.ShoppingCartType,
                                       ShoppingCartTypeId = sc.ShoppingCartTypeId,
                                       Duration = sc.Duration,
                                       ProductId = pd.Id,
                                       StoreId = sc.StoreId,
                                       TaxCategoryId = pd.TaxCategoryId,
                                       ProductAttributes = ConvertAttributeModal(sc.Attributes, pd).Result
                                   }).ToList();

            CalculateTotalsResponseDto result = await CalculateTotals(new CalculateTotalsRequestDto
            {
                PromoCode = requestDto.PromoCode,
                IsTaxRequired = requestDto.IsTaxRequired,
                PromotionId = requestDto.PromotionId,
                AddressId = requestDto.AddressId,
                OrderType = requestDto.OrderType,
                //Username = requestDto.Username,
                StoreId = requestDto.StoreId,
                SelectedTime = requestDto.SelectedTime
            }, false, shoppingCartItemDto);

            response = _mapper.Map<CalculateStoreTotalsResponseDto>(result);
            response.CartItems = shoppingCartItemDto;
            return response;
        }

        public async Task<CalculateTotalsResponseDto> CalculateTotals(CalculateTotalsRequestDto requestDto, bool isOrderPlaced = false, List<ShoppingCartItemDto> cartProducts = null)
        {
            if ((string.IsNullOrWhiteSpace(requestDto.Username) || string.IsNullOrWhiteSpace(requestDto.StoreId)) && cartProducts == null)
                return await Task.FromResult<CalculateTotalsResponseDto>(null);

            CalculateTotalsResponseDto responseDto = new CalculateTotalsResponseDto();
            List<ShoppingCartItemDto> shoppingCartItemDto = new List<ShoppingCartItemDto>();
            List<DiscountDto> promotionsToRemove = new List<DiscountDto>();
            Entities.Discounts.Discount promotion = null;
            List<order_placement_service.Entities.Products.Product> products = null;
            Entities.Customers.Customer customer = null;

            var store = await _storerepository.GetByIdAsync(requestDto.StoreId);
            var country = (store == null) ? null : await _countryrepository.GetByIdAsync(store.DefaultCountryId);

            if (cartProducts == null)
            {
                customer = await _customerRepository.Table.FirstOrDefaultAsync(a => a.Username == requestDto.Username);
                var shoppingCartItems = customer.ShoppingCartItems.Where(a => a.StoreId == requestDto.StoreId).ToList();

                if (shoppingCartItems.Count == 0)
                    return new CalculateTotalsResponseDto { Status = false, Message = "No cart items found" };

                //get Product Ids from Cart
                var productIds = shoppingCartItems.Select(a => a.ProductId).Distinct().ToList();
                products = await _productRepository.Table.Where(x => productIds.Contains(x.Id)).ToListAsync();

                if (products != null)
                {
                    shoppingCartItemDto = (from pd in products
                                           join sc in shoppingCartItems
                                           on pd.Id equals sc.ProductId
                                           select new ShoppingCartItemDto
                                           {
                                               Id = sc.Id,
                                               Name = pd.Name,
                                               Price = pd.Price,
                                               TotalProductPrice = pd.Price * sc.Quantity,
                                               Quantity = sc.Quantity,
                                               ShoppingCartType = sc.ShoppingCartType,
                                               ShoppingCartTypeId = sc.ShoppingCartTypeId,
                                               CreatedOnUtc = sc.CreatedOnUtc,
                                               Duration = sc.Duration,
                                               ProductId = pd.Id,
                                               StoreId = sc.StoreId,
                                               UpdatedOnUtc = sc.UpdatedOnUtc,
                                               TaxCategoryId = pd.TaxCategoryId,
                                               ProductAttributes = ParseProductAttributesFromXml(sc.AttributesXml, pd).Result
                                           }).ToList();
                }
            }
            else
                shoppingCartItemDto = cartProducts;


            //Promotions logic
            if (!string.IsNullOrEmpty(requestDto.PromoCode))
            {
                var coupon = await _discountCouponRepository.Table.Where(x => x.CouponCode.Equals(requestDto.PromoCode)).FirstOrDefaultAsync();
                if (coupon != null)
                    promotion = await _discountRepository.Table.Where(x => x.Stores.Contains(requestDto.StoreId) && x.IsEnabled && x.StartDateUtc <= DateTime.UtcNow && x.EndDateUtc >= DateTime.UtcNow && x.Id.Equals(coupon.DiscountId)).FirstOrDefaultAsync();
                else
                {
                    //return if Promocode is Invalid
                    responseDto.Status = false;
                    responseDto.PromoCodeMessage = "Invalid Promocode!";
                    return responseDto;
                }
            }
            else if (!string.IsNullOrWhiteSpace(requestDto.PromotionId))
            {
                promotion = await _discountRepository.Table.Where(x => x.Stores.Contains(requestDto.StoreId) && x.IsEnabled && x.StartDateUtc <= DateTime.UtcNow && x.EndDateUtc >= DateTime.UtcNow && x.Id.Equals(requestDto.PromotionId)).FirstOrDefaultAsync();

                if (promotion == null)
                {
                    //return if Promocode is Invalid
                    responseDto.Status = false;
                    responseDto.PromoCodeMessage = "Invalid Promocode!";
                    return responseDto;
                }
            }

            //Get address details for calculating tax via AVALARA
            string line1 = string.Empty;
            string city = string.Empty;
            string region = string.Empty;
            string postalCode = string.Empty;
            string countrytwoletterisocode = country?.TwoLetterIsoCode;
            bool canUseAvaTax = false;
            string getAddressDetails = store.CompanyAddress.Trim();
            string parsingAddressException = string.Empty;

            try
            {
                //As per client, companyAddress will always be in this format:
                //3124 Montvale Dr, Springfield, IL 62704
                if (!string.IsNullOrEmpty(getAddressDetails) && !string.IsNullOrEmpty(countrytwoletterisocode))
                {
                    var splitAddressDetails = getAddressDetails.Split(',');
                    if (splitAddressDetails.Length >= 3)
                    {
                        line1 = splitAddressDetails[0].ToString().Trim();
                        city = splitAddressDetails[1].ToString().Trim();
                        var regionandpostalcode = splitAddressDetails[2].ToString().Trim();
                        RegexOptions options = RegexOptions.None;
                        Regex regex = new Regex("[ ]{2,}", options);
                        //Remove extra spaces
                        regionandpostalcode = regex.Replace(regionandpostalcode, " ");

                        var splitregionandpostalcode = Regex.Split(regionandpostalcode, @" ");
                        if (splitregionandpostalcode.Length == 2)
                        {
                            region = splitregionandpostalcode[0].ToString().Trim();
                            postalCode = splitregionandpostalcode[1].ToString().Trim();
                            //Only if get all address data can we use AvaTax
                            canUseAvaTax = true;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                canUseAvaTax = false;
                parsingAddressException = ex.ToString();
            }

            decimal finalAvaCalculatedTax = 0.0M;
            string taxCategoryError = string.Empty;
            var taxJarLineItems = new List<TaxLineItem>();
            var taxJarMain = new Tax();
            int productId = 1;

            //get attributes price
            foreach (var cart in shoppingCartItemDto)
            {
                //Get the name from the current tax category

                if (cart.ProductAttributes != null)
                {
                    foreach (var item in cart.ProductAttributes)
                    {
                        cart.TotalProductPrice = cart.TotalProductPrice + (item.ProductAttributeValues.Sum(a => a.PriceAdjustment) * cart.Quantity);
                    }
                }

                //Generate lines for AvaTax here
                var currentTaxCategory = _taxCategoryRepository.GetById(cart.TaxCategoryId);
                string currentTaxCode = string.Empty;
                decimal currentTotalPrice = cart.TotalProductPrice; //cart.Price * cart.Quantity;
                decimal discountPrice = 0;

                currentTaxCode = currentTaxCategory == null ? "41000" : currentTaxCategory.Name;

                if (responseDto.PromoCodeAmount > 0 && responseDto.SubTotalAmount > 0 && currentTotalPrice > 0)
                {
                    discountPrice = (responseDto.PromoCodeAmount / responseDto.SubTotalAmount) * currentTotalPrice;
                }
                taxJarLineItems.Add(new TaxLineItem { Id = productId.ToString(), UnitPrice = cart.Price, Quantity = cart.Quantity, ProductTaxCode = currentTaxCode, Discount = discountPrice });
                productId++;
            }

            responseDto.SubTotalAmount = shoppingCartItemDto.Sum(a => a.TotalProductPrice);

            //Check if promotion is applied or not
            if (promotion != null)
            {
                //Limitation, percentage, amount and max amount logic
                if (promotion.DiscountLimitation == DiscountLimitationType.NTimesOnly)
                {
                    if (promotion.LimitationTimes < await _discountHistoryRepository.Table.Where(x => x.DiscountId.Equals(promotion.Id)).CountAsync())
                        responseDto.PromoCodeMessage = "This promo code reached it's usage limit";
                    else
                    {
                        responseDto.PromoCodeAmount = promotion.UsePercentage ? (responseDto.SubTotalAmount / 100) * promotion.DiscountPercentage : promotion.DiscountAmount;
                        responseDto.PromoCodeAmount = (promotion.MaximumDiscountAmount.HasValue && responseDto.PromoCodeAmount > Convert.ToDecimal(promotion.MaximumDiscountAmount)) ? Convert.ToDecimal(promotion.MaximumDiscountAmount) : responseDto.PromoCodeAmount;
                    }
                }
                else if (promotion.DiscountLimitation == DiscountLimitationType.NTimesPerCustomer)
                {
                    if (customer != null)
                    {
                        if (promotion.LimitationTimes >= await _discountHistoryRepository.Table.Where(x => x.DiscountId.Equals(promotion.Id) && x.CustomerId.Equals(customer.Id)).CountAsync())
                        {
                            responseDto.PromoCodeAmount = promotion.UsePercentage ? (responseDto.SubTotalAmount / 100) * promotion.DiscountPercentage : promotion.DiscountAmount;
                            responseDto.PromoCodeAmount = (promotion.MaximumDiscountAmount.HasValue && responseDto.PromoCodeAmount > Convert.ToDecimal(promotion.MaximumDiscountAmount)) ? Convert.ToDecimal(promotion.MaximumDiscountAmount) : responseDto.PromoCodeAmount;
                        }
                        else
                            responseDto.PromoCodeMessage = "This promo code reached it's usage limit";
                    }
                }
                else if (promotion.DiscountLimitation == DiscountLimitationType.Unlimited)
                {
                    responseDto.PromoCodeAmount = promotion.UsePercentage ? (responseDto.SubTotalAmount / 100) * promotion.DiscountPercentage : promotion.DiscountAmount;
                    responseDto.PromoCodeAmount = (promotion.MaximumDiscountAmount.HasValue && responseDto.PromoCodeAmount > Convert.ToDecimal(promotion.MaximumDiscountAmount)) ? Convert.ToDecimal(promotion.MaximumDiscountAmount) : responseDto.PromoCodeAmount;
                }
                responseDto.PromotionName = promotion.Name;
                responseDto.PromoCodeMessage = "Promocode Applied!";
            }
            else
                responseDto.TotalAmount = responseDto.SubTotalAmount;

            //If PromoCodeAmount is greater or equal to SubtotalAmount put Zero in total and tax amount
            if (responseDto.PromoCodeAmount >= responseDto.SubTotalAmount)
            {
                responseDto.PromoCodeAmount = 0;
                //responseDto.PromoCodeMessage = "Promocode cannot be applied!";
            }
            else
            {
                responseDto.TotalAmount = responseDto.SubTotalAmount - responseDto.PromoCodeAmount;
            }


            if (!string.IsNullOrWhiteSpace(requestDto.AddressId))
            {
                //Calculation of Delivery Fees logic
                var addresses = _customerRepository.Table.Where(x => x.Username.Equals(requestDto.Username)).Select(a => a.Addresses).ToList();
                var address = addresses.Select(x => x.Where(a => a.Id.Equals(requestDto.AddressId)).FirstOrDefault()).FirstOrDefault();
                if (requestDto.OrderType.ToUpper().Equals("DELIVERY") && address != null)
                {
                    if (store.Configuration.DeliveryFeesByPostalCode.Any(x => x.PostalCodes.Contains(address.ZipPostalCode))
                        && responseDto.SubTotalAmount > store.Configuration.DeliveryFeesByPostalCode.Where(x => x.PostalCodes.Contains(address.ZipPostalCode)).Select(b => b.CartAmount.Min).FirstOrDefault())
                    //&& responseDto.SubTotalAmount < store.Configuration.DeliveryFeesByPostalCode.Where(x => x.PostalCodes.Contains(address.First().ZipPostalCode)).Select(b => b.CartAmount.Max).FirstOrDefault())
                    {
                        responseDto.DeliveryFees = store.Configuration.DeliveryFeesByPostalCode.Where(x => x.PostalCodes.Contains(address.ZipPostalCode)).Select(b => b.Charge).FirstOrDefault();
                    }
                    else if (store.Configuration.DeliveryFeesByRadius.Count > 0 && responseDto.DeliveryFees == 0)
                    {
                        try
                        {
                            string uri = string.Format(_appSettings.TomTom.RoutingURL, _appSettings.TomTom.Version, address.Coordinates.lat + "," + address.Coordinates.lon + ":" + store.Address.Coordinates.lat + "," + store.Address.Coordinates.lon, _appSettings.TomTom.Key);
                            MyHttpClientFactory myHttpClient = new MyHttpClientFactory(string.Empty);
                            var distanceOutput = myHttpClient.Get<DistanceRoutingResponse>(uri);
                            var radiusBetweenAddresses = distanceOutput.routes.FirstOrDefault().summary.lengthInMeters / 1000;

                            //throw exception if the Delivery is not possible
                            if (!store.Configuration.DeliveryFeesByRadius.Any(x => radiusBetweenAddresses > x.Radius.Min && radiusBetweenAddresses < x.Radius.Max))
                                return new CalculateTotalsResponseDto { Message = $"Store cannot deliver to your location.", Status = false };

                            else if (store.Configuration.DeliveryFeesByRadius.Select(x => x.CartAmount.Min).FirstOrDefault() > responseDto.TotalAmount)
                                new CalculateTotalsResponseDto { Message = $"Cart amount must be more than or equal to { store.Configuration.DeliveryFeesByRadius.Select(x => x.CartAmount.Min).FirstOrDefault()}", Status = false };

                            responseDto.DeliveryFees = store.Configuration.DeliveryFeesByRadius.Where(x => radiusBetweenAddresses > x.Radius.Min && radiusBetweenAddresses < x.Radius.Max && responseDto.TotalAmount > x.CartAmount.Min).Select(y => y.Charge).FirstOrDefault();
                        }
                        catch (Exception ex)
                        {
                            return new CalculateTotalsResponseDto { Message = $"There was an issue while calculating the delivery fees: {ex.Message}", Status = false };
                            //throw new Exception($"There was an issue while calculating the delivery fees: {ex.Message}");
                        }
                    }
                }
            }

            responseDto.TotalAmount = responseDto.TotalAmount + responseDto.DeliveryFees;

            //Check if we can use AvaTax based on our address parsing result
            if (canUseAvaTax && requestDto.IsTaxRequired)
            {
                try
                {
                    var transaction = _taxjarApiClient.TaxForOrder(new
                    {
                        from_street = line1,
                        from_city = city,
                        from_state = region,
                        from_zip = postalCode,
                        from_country = countrytwoletterisocode,
                        line_items = (from line in taxJarLineItems
                                      select new
                                      {
                                          id = line.Id,
                                          quantity = line.Quantity,
                                          unit_price = line.UnitPrice,
                                          product_tax_code = line.ProductTaxCode,
                                          discount = (responseDto.PromoCodeAmount > 0) ? responseDto.PromoCodeAmount / taxJarLineItems.Count : 0
                                      }).ToArray(),
                        to_street = line1,
                        to_city = city,
                        to_state = region,
                        to_zip = postalCode,
                        to_country = countrytwoletterisocode,
                        amount = responseDto.SubTotalAmount,
                        shipping = responseDto.DeliveryFees
                    });

                    finalAvaCalculatedTax = (decimal)transaction.AmountToCollect;
                    responseDto.TaxAmount = finalAvaCalculatedTax;

                    //Now since there can be a case where 4 items have taxcategory id and 1 does not have, then send an email
                    if (!string.IsNullOrEmpty(taxCategoryError))
                    {
                        bool IsSentExceptionEmail = await SendAvalaraExceptionEmail(taxCategoryError);
                        if (!IsSentExceptionEmail)
                        {
                            //Add logging here if email sending failed
                        }
                    }
                }
                catch (Exception ex)
                {
                }
            }
            else
            {
                //No tax shown to user if Avalara tax api fails
                responseDto.TaxAmount = 0;
            }

            //Get final amount after tax calculation
            responseDto.TotalAmount = responseDto.TotalAmount + responseDto.TaxAmount;
            //responseDto.SubTotalAmount = responseDto.SubTotalAmount + responseDto.TaxAmount;

            return responseDto;
        }

        public async Task<bool> SendAvalaraExceptionEmail(string taxException)
        {
            string body = @"<head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
    <style type='text/css'>
       
        
        #outlook a {
            padding: 0;
            text-decoration: none !important;
        }

       
        .ReadMsgBody {
            width: 100%;
        }

        .ExternalClass {
            width: 100%;
        }

        
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: 100%;
        }

       
        body,
        table,
        td,
        p,
        a,
        li,
        blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        
        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

      
        img {
            -ms-interpolation-mode: bicubic;
        }

       
        body {
            margin: 0;
            padding: 0;
        }

        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body,
        #bodyTable,
        #bodyCell {
            height: 100% !important;
            margin: 0;
            padding: 0;
            width: 100% !important;
        }


        #bodyCell {
            padding: 20px;
        }

        #templateContainer {
            width: 600px;
        }

        body,
        #bodyTable {
            background-color: #F8F8F8;
        }
        #bodyCell {
            border-top: 2px solid #BBBBBB;
        }
        #templateContainer {
            border: 1px solid #BBBBBB;
        }
        h1 {
            color: #202020 !important;
            display: block;
            font-family: Helvetica;
            font-size: 26px;
            font-style: normal;
            font-weight: bold;
            line-height: 100%;
            letter-spacing: normal;
            margin-top: 0;
            margin-right: 0;
            margin-bottom: 10px;
            margin-left: 0;
            text-align: left;
        }
        h2 {
            display: block;
            font-style: normal;
            font-weight: bold;
            line-height: 150%;
            letter-spacing: normal;
            margin-top: 0;
            margin-right: 0;
            margin-bottom: 10px;
            margin-left: 0;
            text-align: left;
            font-family:'Open Sans', sans-serif;
            font-size:18px;
            color:#4e4e4e !important;
        }
        h3 {
            color: #606060 !important;
            display: block;
            font-family: Helvetica;
            font-size: 16px;
            font-style: italic;
            font-weight: normal;
            line-height: 100%;
            letter-spacing: normal;
            margin-top: 0;
            margin-right: 0;
            margin-bottom: 10px;
            margin-left: 0;
            text-align: left;
        }
        h4 {
            color: #808080 !important;
            display: block;
            font-family: Helvetica;
            font-size: 14px;
            font-style: italic;
            font-weight: normal;
            line-height: 100%;
            letter-spacing: normal;
            margin-top: 0;
            margin-right: 0;
            margin-bottom: 10px;
            margin-left: 0;
            text-align: left;
        }
       
        #templateHeader {
            background-color: #F8F8F8;
            border-top: 1px solid #FFFFFF;
            border-bottom: 1px solid #CCCCCC;
        }
        .headerContent {
            font-family:'Lato', sans-serif;
            line-height: 100%;
            padding-top: 15px;
            padding-right: 0;
            padding-bottom: 15px;
            padding-left: 20px;
            text-align: left;
            vertical-align: middle;
            font-size:26px;
            font-weight:bold;
            color:#111111;
        }

        .headerContent a:link,
        .headerContent a:visited,
        
        .headerContent a .yshortcuts {
            color: #EB4102;
            font-weight: normal;
            text-decoration: underline;
        }

        #headerImage {
            height: auto;
            max-width: 600px;
        }

       
        #templateBody {
            background-color: #FFFFFF;
            border-top: 1px solid #FFFFFF;
            border-bottom: 1px solid #CCCCCC;
        }
        .bodyContent {
            font-family: 'Lato', sans-serif;
            font-size: 14px;
            line-height: 135%;
            color:rgb(142, 142, 147) !important;
            padding-top: 20px;
            padding-right: 20px;
            padding-bottom: 20px;
            padding-left: 20px;
            text-align: left;
        }
        .bodyContent a:link,
        .bodyContent a:visited,
       
        .bodyContent a .yshortcuts {
            color: #EB4102;
            font-weight: normal;
            text-decoration: underline;
        }

        .bodyContent img {
            display: inline;
            height: auto;
            max-width: 560px;
        }

        
        #templateFooter {
            background-color: #FFFFFF;
        }
        .footerContent {
            color: #808080;
            font-family: Helvetica;
            font-size: 10px;
            line-height: 100%;
            padding-top: 20px;
            padding-right: 20px;
            padding-bottom: 20px;
            padding-left: 20px;
            text-align: left;
        }
        .footerContent a:link,
        .footerContent a:visited,
       
        .footerContent a .yshortcuts,
        .footerContent a span {
            color: #606060;
            font-weight: normal;
            text-decoration: underline;
        }
        #address {
            background-color: #F8F8F8;
            border-top: 1px solid #CCCCCC;
        }

       

        @@media only screen and (max-width: 480px) {
            body,
            table,
            td,
            p,
            a,
            li,
            blockquote {
                -webkit-text-size-adjust: none !important;
            }

           
            body {
                width: 100% !important;
                min-width: 100% !important;
            }

          
            #bodyCell {
                padding: 10px !important;
            }

          
            #templateContainer {
                max-width: 600px !important;
                width: 100% !important;
            }
            h1 {
                font-size: 24px !important;
                line-height: 100% !important;
            }
            h2 {
                font-size: 20px !important;
                line-height: 100% !important;
            }
            h3 {
                font-size: 18px !important;
                line-height: 100% !important;
            }
            h4 {
                font-size: 16px !important;
                line-height: 100% !important;
            }

           
            #headerImage {
                height: auto !important;
                max-width: 600px !important;
                width: 100% !important;
            }
            .headerContent {
                font-size: 20px !important;
                line-height: 125% !important;
            }

            .bodyContent {
                font-size: 18px !important;
                line-height: 125% !important;
            }

          
            .footerContent {
                font-size: 14px !important;
                line-height: 115% !important;
            }

            .footerContent a {
                display: block !important;
            }
        }
    </style>
</head>

<body leftmargin='0' marginwidth='0' topmargin='0' marginheight='0' offset='0'>
    <center>
        <table align='center' border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
            <tr>
                <td align='center' valign='top' id='bodyCell'>
                    <!-- BEGIN TEMPLATE // -->
                    <table border='0' cellpadding='0' cellspacing='0' id='templateContainer'>
                        <tr>
                            <td align='center' valign='top'>
                                <table border='0' cellpadding='0' cellspacing='0' width='100%' id='templateHeader'>
                                    <tr>
                                        <td valign='top' class='headerContent'>
                                           
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align='center' valign='top'>
                                <!-- BEGIN BODY // -->
                                <table border='0' cellpadding='0' cellspacing='0' width='100%' id='templateBody'>
                                    <tr>
                                        <td valign='top' class='bodyContent' mc:edit='body_content'>
                                            <h2>Exception from TajJar Tax API on {currentutctime}:</h2>
                                            {exception}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align='center' valign='top'>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!-- // CENTERING TABLE -->
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='top' class='bodyContent' mc:edit='body_content'>
                                            <p>Thanks</p>
                                            The SwiftServe Team
                                        </td>
                                    </tr>
                                </table>
                                <!-- // END BODY -->
                            </td>
                        </tr>
                    </table>
                    <!-- // END TEMPLATE -->
                </td>
            </tr>
        </table>
    </center>
</body>";
            body = body.Replace("{currentutctime}", DateTime.UtcNow.ToString()).Replace("{exception}", taxException);
            var response = await _emailService.SendEmail(new EmailRequestDto { Body = body, CustomerEmail = _appSettings.TaxJar.TaxJarSupportEmail, Subject = "Exception in TaxJar Tax API" });

            return response.IsEmailSent;
        }

        private async Task<List<ProductAttributesDto>> ParseProductAttributesFromXml(string xmlToParse, order_placement_service.Entities.Products.Product product)
        {
            List<ProductAttributesDto> productAttributes = null;
            if (!string.IsNullOrWhiteSpace(xmlToParse))
            {
                productAttributes = new List<ProductAttributesDto>();
                var attributes = await _webHelper.Deserialize<Model.CartFacade.Attributes>(xmlToParse);

                productAttributes = (from prodAttr in product.ProductAttributeMappings
                                     join attr in attributes.ProductAttribute
                                     on prodAttr.Id equals attr.ID
                                     join addAttr in await _productAttributeRepository.Table.ToListAsync()
                                     on prodAttr.ProductAttributeId equals addAttr.Id
                                     select new ProductAttributesDto
                                     {
                                         Id = attr.ID,
                                         ProductAttributeName = addAttr.Name,
                                         ProductAttributeValues = (from value in prodAttr.ProductAttributeValues
                                                                   join attrValue in attr.ProductAttributeValue
                                                                   on value.Id equals attrValue.Value
                                                                   select new ProductAttributeValueDto
                                                                   {
                                                                       Id = value.Id,
                                                                       Cost = value.Cost ?? 0,
                                                                       Name = value.Name,
                                                                       PriceAdjustment = value.PriceAdjustment ?? 0,
                                                                       ExternalAttributeId = value.ExternalAttributeId
                                                                   }).ToList()
                                     }).ToList();
            }

            return productAttributes;
        }


        /// <summary>
        /// Inserts an order
        /// </summary>
        /// <param name="order">Order</param>
        public virtual async Task InsertOrder(Entities.Orders.Order order)
        {
            if (order == null)
                throw new ArgumentNullException("order");

            var orderExists = _orderRepository.Table.OrderByDescending(x => x.OrderNumber).Select(x => x.OrderNumber).FirstOrDefault();
            order.OrderNumber = orderExists != 0 ? orderExists + 1 : 1;

            await _orderRepository.InsertAsync(order);

            ////event notification
            //await _mediator.EntityInserted(order);
        }

        public virtual async Task ClearShoppingCartItem(string customerId, IList<ShoppingCartItem> cart)
        {
            var customer = await _customerRepository.Table.Where(a => a.Id.Equals(customerId)).FirstOrDefaultAsync();
            var cartItemToDelete = customer.ShoppingCartItems.Where(a => cart.Select(b => b.Id).ToArray().Contains(a.Id)).ToList();
            foreach (var item in cartItemToDelete)
            {
                customer.ShoppingCartItems.Remove(item);
            }
            var customerUpdated = _customerRepository.Update(customer);
        }

        public virtual async Task UpdateCustomerLastUpdateCartDate(string customerId, DateTime? date)
        {
            var builder = Builders<Entities.Customers.Customer>.Filter;
            var filter = builder.Eq(x => x.Id, customerId);
            var update = Builders<Entities.Customers.Customer>.Update
                .Set(x => x.LastUpdateCartDateUtc, date);
            await _customerRepository.Collection.UpdateOneAsync(filter, update);
        }
        public virtual async Task UpdateCustomerLastUpdateWishList(string customerId, DateTime date)
        {
            var builder = Builders<Entities.Customers.Customer>.Filter;
            var filter = builder.Eq(x => x.Id, customerId);
            var update = Builders<Entities.Customers.Customer>.Update
                .Set(x => x.LastUpdateWishListDateUtc, date);
            await _customerRepository.Collection.UpdateOneAsync(filter, update);
        }

        /// </summary>
        /// <param name="orderNote">The order note</param>
        public virtual async Task InsertOrderNote(OrderNote orderNote)
        {
            if (orderNote == null)
                throw new ArgumentNullException("orderNote");

            await _orderNoteRepository.InsertAsync(orderNote);

            ////event notification
            //await _mediator.EntityInserted(orderNote);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="attributes"></param>
        /// <param name="product"></param>
        /// <returns></returns>
        private async Task<List<ProductAttributesDto>> ConvertAttributeModal(Model.CartFacade.Attributes attributes, order_placement_service.Entities.Products.Product product)
        {
            List<ProductAttributesDto> productAttributes = null;
            WebHelper helper = new WebHelper();
            if (attributes != null && product != null)
            {
                productAttributes = (from prodAttr in product.ProductAttributeMappings
                                     join attr in attributes.ProductAttribute
                                     on prodAttr.Id equals attr.ID
                                     join addAttr in await _productAttributeRepository.Table.ToListAsync()
                                     on prodAttr.ProductAttributeId equals addAttr.Id
                                     select new ProductAttributesDto
                                     {
                                         Id = attr.ID,
                                         ProductAttributeName = addAttr.Name,
                                         ProductAttributeValues = (from value in prodAttr.ProductAttributeValues
                                                                   join attrValue in attr.ProductAttributeValue
                                                                   on value.Id equals attrValue.Value
                                                                   select new ProductAttributeValueDto
                                                                   {
                                                                       Id = value.Id,
                                                                       Cost = value.Cost ?? 0,
                                                                       Name = value.Name,
                                                                       PriceAdjustment = value.PriceAdjustment ?? 0
                                                                   }).ToList()
                                     }).ToList();
            }

            return productAttributes;
        }

        public async Task<PlaceOrderResultDto> PlaceStoreOrder(StoreOrderRequestDto requestDto)
        {
            if (requestDto.Products == null || requestDto.Products.Count < 1)
                return new PlaceOrderResultDto { Errors = new List<string> { "No products are available to place order. Please add products to proceed." } };

            if (requestDto.Delivery.Type.ToUpper().Equals("DELIVERY") && (requestDto.Delivery.Address == null || string.IsNullOrWhiteSpace(requestDto.Delivery.Address.Address1)))
                return new PlaceOrderResultDto { Errors = new List<string> { "Please add address for delivery type Orders" } };

            CalculateTotalsResponseDto storeTotals = new CalculateTotalsResponseDto();
            PlaceOrderResult response = new PlaceOrderResult();
            PaymentIntent intentOutput = new PaymentIntent();

            var customer = await _customerRepository.Table.Where(x => x.Username == requestDto.Customer.PhoneNumber).FirstOrDefaultAsync();
            //If customer (phone number) is not available in DB then create the customer
            if (customer == null)
            {
                customer = await _customerRepository.InsertAsync(new Entities.Customers.Customer
                {
                    Active = true,
                    Username = requestDto.Customer.PhoneNumber,
                    DisplayName = requestDto.Customer.Name,
                    Email = requestDto.Customer.Email
                });
            }

            var totals = await CalculateStoreTotals(new CalculateStoreTotalsRequestDto
            {
                IsTaxRequired = true,
                OrderType = requestDto.OrderType,
                Products = requestDto.Products,
                PromoCode = requestDto.PromoCode,
                PromotionId = requestDto.PromotionId,
                StoreId = requestDto.StoreId,
                Username = requestDto.Username
            });

            //Since we need to leverage the current code so we are converting the Store totals to totals object and using the cartitems from storetotals output
            storeTotals = _mapper.Map<CalculateTotalsResponseDto>(totals);
            storeTotals.TotalAmount = storeTotals.TotalAmount + requestDto.TipAmount;
            //If intent is available check the totalamount and payment received by intent is same
            if (requestDto.Payment != null && !string.IsNullOrWhiteSpace(requestDto.Payment.PaymentIntentId))
            {
                intentOutput = await _paymentService.RetrievePaymentIntent(requestDto.Payment.PaymentIntentId);
                if (intentOutput == null)
                    return new PlaceOrderResultDto { Errors = new List<string> { "No Payment intent found!" } };
                else if (!intentOutput.Status.Equals("succeeded") && !intentOutput.Status.Equals("requires_capture"))
                    return new PlaceOrderResultDto { Errors = new List<string> { $"Incorrect payment intent status returned {intentOutput.Status}" } };
                else if (intentOutput.Status.Equals("succeeded") && storeTotals.TotalAmount != (decimal)intentOutput.AmountReceived / 100)
                    return new PlaceOrderResultDto { Errors = new List<string> { "Payment succeeded but not equal to the total amount per Swiftserve." } };
                else if (intentOutput.Status.Equals("requires_capture") && storeTotals.TotalAmount != (decimal)intentOutput.AmountCapturable / 100)
                    return new PlaceOrderResultDto { Errors = new List<string> { "Payment status requires_capture but not equal to the total amount per Swiftserve." } };
            }

            //Create and save the Order in SS database system
            ProcessPaymentRequest processPaymentRequest = _mapper.Map<ProcessPaymentRequest>(requestDto);
            processPaymentRequest.OrderType = requestDto.Delivery.Type;
            processPaymentRequest.OrderGuid = Guid.NewGuid();
            var details = await PreparePlaceOrderDetails(processPaymentRequest, customer);

            details.Cart = (from cart in totals.CartItems
                            join product in requestDto.Products on cart.ProductId equals product.ProductId
                            select new ShoppingCartItem
                            {
                                AttributesXml = _webHelper.Serialize<Model.CartFacade.Attributes>(product.Attributes).Result,
                                ProductId = product.ProductId,
                                CreatedOnUtc = cart.CreatedOnUtc,
                                DeliveryTime = cart.DeliveryTime,
                                Duration = cart.Duration,
                                OrderType = cart.OrderType,
                                Quantity = cart.Quantity,
                                StoreId = cart.StoreId,
                                Id = Guid.NewGuid().ToString(),
                                ShoppingCartType = cart.ShoppingCartType,
                                ShoppingCartTypeId = cart.ShoppingCartTypeId
                            }).ToList();

            var qrCode = string.IsNullOrWhiteSpace(processPaymentRequest.ExtId) ? new QiCodes() : _qicrepository.Table.Where(a => a.ExtId.Equals(processPaymentRequest.ExtId)).FirstOrDefault();

            Entities.Orders.Order order = new Entities.Orders.Order(); ;

            if (!processPaymentRequest.PayAtStore)
            {
                order = PrepareOrder(processPaymentRequest, new ProcessPaymentResult(), details, storeTotals, qrCode, intentOutput);
                response.PlacedOrder = _mapper.Map<Entities.Orders.Order>(await SaveOrderDetails(details, order));
            }
            //Scenario for Pay at Store
            else if (processPaymentRequest.PayAtStore)
            {
                order = PrepareOrder(processPaymentRequest, new ProcessPaymentResult { NewPaymentStatus = PaymentStatus.PayAtStore, PaymentType = "PAY-AT-STORE" }, details, storeTotals, qrCode, intentOutput);
                response.PlacedOrder = _mapper.Map<Entities.Orders.Order>(await SaveOrderDetails(details, order));
            }

            order.DeliveryAddress = new Entities.Common.Address
            {
                Address1 = requestDto.Delivery.Address.Address1,
                Address2 = requestDto.Delivery.Address.Address2,
                City = requestDto.Delivery.Address.City,
                StateProvinceId = requestDto.Delivery.Address.StateProvinceId,
                CountryId = requestDto.Delivery.Address.CountryId,
                ZipPostalCode = requestDto.Delivery.Address.ZipPostalCode
            };

            var cloverOrderPlaced = await AddOrderToClover(processPaymentRequest, qrCode, response, order, details);

            if (!cloverOrderPlaced)
            {
                await _orderRepository.DeleteAsync(response.PlacedOrder);
                return new PlaceOrderResultDto { Errors = new List<string> { "There was an issue while posting the Order to Clover" } };
            }

            SendMessageToSQSQueue(_mapper.Map<PlaceOrderResult>(response));
            return _mapper.Map<PlaceOrderResultDto>(response);
        }

        private async Task<bool> AddOrderToClover(ProcessPaymentRequest processPaymentRequest, QiCodes qrCode, PlaceOrderResult result, Entities.Orders.Order order, PlaceOrderContainter details)
        {
            bool orderPlaced = false;
            try
            {
                //Save Order to Clover Details
                var store = _storerepository.Table.Where(x => x.Id.Equals(processPaymentRequest.StoreId)).FirstOrDefault();

                if (store.ThirdPartyConfig != null && !string.IsNullOrEmpty(store.ThirdPartyConfig.MerchantId))
                {
                    CloverOrderDto orderDto = new CloverOrderDto();
                    orderDto.credential.AccessToken = store.ThirdPartyConfig.AccessToken;
                    orderDto.credential.BaseUrl = store.ThirdPartyConfig.BaseUrl;
                    orderDto.credential.MerchantId = store.ThirdPartyConfig.MerchantId;
                    List<LineItemDto> lineItems = new List<LineItemDto>();
                    foreach (var item in result.PlacedOrder.OrderItems)
                    {
                        var product = _productRepository.Table.FirstOrDefaultAsync(a => a.Id.Equals(item.ProductId)).Result;
                        var lineItem = new LineItemDto { LineItemId = product.ExternalId, Quantity = item.Quantity, Note = item.AdditionalComments };
                        var ordersAttributes = ParseProductAttributesFromXml(item.AttributesXml, product).Result;
                        foreach (var attr in ordersAttributes)
                        {
                            foreach (var modifier in attr.ProductAttributeValues)
                            {
                                lineItem.Modifiers.Add(new ModifierDto { ModifierId = modifier.ExternalAttributeId });
                            }
                        }
                        lineItems.Add(lineItem);
                    }
                    orderDto.LineItems = lineItems;
                    _externalRepository = new CloverDataRepository();

                    string orderNote = (qrCode == null || string.IsNullOrWhiteSpace(qrCode.DisplayText)) ? $"#Customer: {result.PlacedOrder.FirstName} {result.PlacedOrder.LastName} #Phone: {processPaymentRequest.UserName} #OrderNotes: {result.PlacedOrder.OrderComment} #OrderType: {order.DeliveryType}" : $"#Customer: {result.PlacedOrder.FirstName} {result.PlacedOrder.LastName} #Phone: {processPaymentRequest.UserName} #OrderNotes: {result.PlacedOrder.OrderComment}  #OrderType: {order.DeliveryType} #QRCode: {qrCode.DisplayText}";
                    orderNote = (order.DeliveryAddress != null) ? orderNote + GetDeliveryAddressString(order.DeliveryAddress) : orderNote;
                    orderNote = (string.IsNullOrWhiteSpace(order.DeliveryTime)) ? string.Empty : $" #Pickup/Delivery time: {order.DeliveryTime}";

                    ExternalOrderRequestDto requestDto = new ExternalOrderRequestDto
                    {
                        note = orderNote,
                        title = $"SwiftServe Order: {result.PlacedOrder.OrderNumber.ToString()}",//This will be shown in OrderNumber under Clover Order Detail
                        paymentState = (result.PlacedOrder.PaymentStatus == PaymentStatus.PayAtStore) ? "OPEN" : "PAID",
                        status = "Open",
                        taxRemoved = true,
                        total = result.PlacedOrder.OrderTotal * 100 + result.PlacedOrder.OrderTax * 100 + result.PlacedOrder.TipAmount * 100, //total Order amount is considered in Cents
                        externalReferenceId = result.PlacedOrder.OrderNumber.ToString(),
                        customers = new List<ExternalDataAccess.Models.Customer>
                        {
                            new ExternalDataAccess.Models.Customer
                            {
                                firstName = result.PlacedOrder.FirstName,
                                lastName = result.PlacedOrder.LastName,
                                phoneNumbers = new List<PhoneNumbers>
                                {
                                    new PhoneNumbers
                                    {
                                        //Username is Phone Number in SwiftServe
                                         phoneNumber = details.Customer.Username
                                    }
                                },
                                emailAddresses = new List<EmailAddresses>
                                {
                                   new EmailAddresses
                                   {
                                       emailAddress = result.PlacedOrder.CustomerEmail
                                   }
                                }
                            }
                        },
                        lineItems = new List<LineItems>
                        {
                            new LineItems
                            {
                                alternateName = "Tax from SwiftServe",
                                name = "SwiftServe Tax Amount",
                                price = result.PlacedOrder.OrderTax * 100,
                                exchanged = false,
                                isRevenue = false,
                                printed = false,
                                refund = new ExternalDataAccess.Models.Refund
                                {
                                    transactionInfo = new TransactionInfo
                                    {
                                        emergencyFlag = false,
                                        isTokenBasedTx = false
                                    }
                                },
                                refunded = false
                            },
                            new LineItems
                            {
                                alternateName = "Tip from SwiftServe",
                                name = "SwiftServe Tip Amount",
                                price = result.PlacedOrder.TipAmount * 100,
                                exchanged = false,
                                isRevenue = false,
                                printed = false,
                                refund = new ExternalDataAccess.Models.Refund
                                {
                                    transactionInfo = new TransactionInfo
                                    {
                                        emergencyFlag = false,
                                        isTokenBasedTx = false
                                    }
                                },
                                refunded = false
                            },
                            new LineItems
                            {
                                alternateName = "Delivery fees from SwiftServe",
                                name = "SwiftServe Delivery fees",
                                price = result.PlacedOrder.DeliveryFees * 100,
                                exchanged = false,
                                isRevenue = false,
                                printed = false,
                                refund = new ExternalDataAccess.Models.Refund
                                {
                                    transactionInfo = new TransactionInfo
                                    {
                                        emergencyFlag = false,
                                        isTokenBasedTx = false
                                    }
                                },
                                refunded = false
                            }
                        }
                    };

                    string cloverOrderId = _externalRepository.SaveOrder(orderDto, requestDto);
                    result.PlacedOrder.ExternalOrderId = cloverOrderId;
                    await _orderRepository.UpdateAsync(result.PlacedOrder);
                }
                orderPlaced = true;
            }
            catch (Exception ex)
            {
                //TODO - Log
            }
            return orderPlaced;
        }
    }
}
