﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using order_placement_service.Entities.Common;
using order_placement_service.Enums;
using System;
using System.Collections.Generic;

namespace order_placement_service.Entities.Orders
{
    /// <summary>
    /// Represents an order
    /// </summary>
    public class Order : BaseEntity
    {

        #region Properties

        /// <summary>
        /// Gets or sets the order identifier
        /// </summary>
        public Guid OrderGuid { get; set; }

        /// <summary>
        /// Gets or sets the order identifier
        /// </summary>
        public int OrderNumber { get; set; }

        /// <summary>
        /// Gets or sets the order code 
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Gets or sets the store identifier
        /// </summary>
        public string StoreId { get; set; }

        /// <summary>
        /// Gets or sets the customer identifier
        /// </summary>
        public string CustomerId { get; set; }

        /// <summary>
        /// Gets or sets the owner identifier
        /// </summary>
        public string OwnerId { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether a customer chose "pick up in store" shipping option
        /// </summary>
        public bool PickUpInStore { get; set; }

        /// <summary>
        /// Gets or sets an order status identifier
        /// </summary>
        public int OrderStatusId { get; set; }

        /// <summary>
        /// Gets or sets the shipping status identifier
        /// </summary>
        public int ShippingStatusId { get; set; }

        /// <summary>
        /// Gets or sets the payment status identifier
        /// </summary>
        public int PaymentStatusId { get; set; }

        /// <summary>
        /// Gets or sets the payment method system name
        /// </summary>
        public string PaymentMethodSystemName { get; set; }

        /// <summary>
        /// Gets or sets the customer currency code (at the moment of order placing)
        /// </summary>
        public string CustomerCurrencyCode { get; set; }

        /// <summary>
        /// Gets or sets the primary currency code (at the moment of order placing)
        /// </summary>
        public string PrimaryCurrencyCode { get; set; }

        /// <summary>
        /// Gets or sets the currency rate
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal CurrencyRate { get; set; }

        /// <summary>
        /// Gets or sets the customer tax display type identifier
        /// </summary>
        public int CustomerTaxDisplayTypeId { get; set; }

        /// <summary>
        /// Gets or sets the VAT number 
        /// </summary>
        public string VatNumber { get; set; }

        /// <summary>
        /// Gets or sets the VAT number status id
        /// </summary>
        public int VatNumberStatusId { get; set; }

        /// <summary>
        /// Gets or sets the Company name
        /// </summary>
        public string CompanyName { get; set; }

        /// <summary>
        /// Gets or sets the CustomerEmail
        /// </summary>
        public string CustomerEmail { get; set; }

        /// <summary>
        /// Gets or sets the FirstName
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// Gets or sets the LastName
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Gets or sets the order subtotal (incl tax)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderSubtotalInclTax { get; set; }

        /// <summary>
        /// Gets or sets the order subtotal (excl tax)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderSubtotalExclTax { get; set; }

        /// <summary>
        /// Gets or sets the order subtotal discount (incl tax)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderSubTotalDiscountInclTax { get; set; }

        /// <summary>
        /// Gets or sets the order subtotal discount (excl tax)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderSubTotalDiscountExclTax { get; set; }

        /// <summary>
        /// Gets or sets the order shipping (incl tax)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderShippingInclTax { get; set; }

        /// <summary>
        /// Gets or sets the order shipping (excl tax)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderShippingExclTax { get; set; }

        /// <summary>
        /// Gets or sets the payment method additional fee (incl tax)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal PaymentMethodAdditionalFeeInclTax { get; set; }

        /// <summary>
        /// Gets or sets the payment method additional fee (excl tax)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal PaymentMethodAdditionalFeeExclTax { get; set; }

        /// <summary>
        /// Gets or sets the tax rates
        /// </summary>
        public string TaxRates { get; set; }

        /// <summary>
        /// Gets or sets the order tax
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderTax { get; set; }

        /// <summary>
        /// Gets or sets the order discount (applied to order total)
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderDiscount { get; set; }

        /// <summary>
        /// Gets or sets the order total
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal OrderTotal { get; set; }

        /// <summary>
        /// Gets or sets the refunded amount
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal RefundedAmount { get; set; }

        /// <summary>
        /// Gets or sets the refunded amount
        /// </summary>
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public decimal TipAmount { get; set; }

        /// <summary>
        /// Gets or sets the value indicating whether reward points were earned for this order
        /// </summary>
        public bool RewardPointsWereAdded { get; set; }

        /// Gets or sets the value indicating for calculated reward points 
        public int CalcRewardPoints { get; set; }

        /// <summary>
        /// Gets or sets the checkout attribute description
        /// </summary>
        public string CheckoutAttributeDescription { get; set; }

        /// <summary>
        /// Gets or sets the checkout attributes in XML format
        /// </summary>
        public string CheckoutAttributesXml { get; set; }

        /// <summary>
        /// Gets or sets the customer language identifier
        /// </summary>
        public string CustomerLanguageId { get; set; }

        /// <summary>
        /// Gets or sets the affiliate identifier
        /// </summary>
        public string AffiliateId { get; set; }

        /// <summary>
        /// Gets or sets the customer IP address
        /// </summary>
        public string CustomerIp { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether storing of credit card number is allowed
        /// </summary>
        public bool AllowStoringCreditCardNumber { get; set; }

        /// <summary>
        /// Gets or sets the card type
        /// </summary>
        public string CardType { get; set; }

        /// <summary>
        /// Gets or sets the card name
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// Gets or sets the card number
        /// </summary>
        public string CardNumber { get; set; }

        /// <summary>
        /// Gets or sets the masked credit card number
        /// </summary>
        public string MaskedCreditCardNumber { get; set; }

        /// <summary>
        /// Gets or sets the card CVV2
        /// </summary>
        public string CardCvv2 { get; set; }

        /// <summary>
        /// Gets or sets the card expiration month
        /// </summary>
        public string CardExpirationMonth { get; set; }

        /// <summary>
        /// Gets or sets the card expiration year
        /// </summary>
        public string CardExpirationYear { get; set; }

        /// <summary>
        /// Gets or sets the authorization transaction identifier
        /// </summary>
        public string AuthorizationTransactionId { get; set; }

        /// <summary>
        /// Gets or sets the authorization transaction code
        /// </summary>
        public string AuthorizationTransactionCode { get; set; }

        /// <summary>
        /// Gets or sets the authorization transaction result
        /// </summary>
        public string AuthorizationTransactionResult { get; set; }

        /// <summary>
        /// Gets or sets the capture transaction identifier
        /// </summary>
        public string CaptureTransactionId { get; set; }

        /// <summary>
        /// Gets or sets the capture transaction result
        /// </summary>
        public string CaptureTransactionResult { get; set; }

        /// <summary>
        /// Gets or sets the subscription transaction identifier
        /// </summary>
        public string SubscriptionTransactionId { get; set; }

        /// <summary>
        /// Gets or sets the paid date and time
        /// </summary>
        public DateTime? PaidDateUtc { get; set; }

        /// <summary>
        /// Gets or sets the shipping method
        /// </summary>
        public string ShippingMethod { get; set; }

        /// <summary>
        /// Gets or sets the shipping rate computation method identifier
        /// </summary>
        public string ShippingRateComputationMethodSystemName { get; set; }

        /// <summary>
        /// Gets or sets the serialized CustomValues (values from ProcessPaymentRequest)
        /// </summary>
        public string CustomValuesXml { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the entity has been deleted
        /// </summary>
        public bool Deleted { get; set; }

        /// <summary>
        /// Gets or sets the date and time of order creation
        /// </summary>
        public DateTime CreatedOnUtc { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the entity has been imported
        /// </summary>
        public bool Imported { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the url referrer exists
        /// </summary>
        public string UrlReferrer { get; set; }

        /// <summary>
        /// Gets or sets the Shipping Option description (customer friendly string)
        /// </summary>
        public string ShippingOptionAttributeDescription { get; set; }

        /// <summary>
        /// Gets or sets the Shipping Option in XML format (developer friendly string)
        /// </summary>
        public string ShippingOptionAttributeXml { get; set; }

        /// <summary>
        /// Gets or sets stripe payment id
        /// </summary>
        public string StripePaymentId { get; set; }

        #endregion

        #region Navigation properties

        /// <summary>
        /// Gets or sets the billing address
        /// </summary>
        public Address BillingAddress { get; set; }

        /// <summary>
        /// Gets or sets the shipping address
        /// </summary>
        public Address ShippingAddress { get; set; }

        /// <summary>
        /// Gets or sets the pickup point
        /// </summary>
        public PickupPoint PickupPoint { get; set; }

        /// <summary>
        /// Gets or sets the reward points history record
        /// </summary>
        public RewardPointsHistory RedeemedRewardPointsEntry { get; set; }

        /// <summary>
        /// Gets or sets order items
        /// </summary>
        public List<OrderItem> OrderItems { get; set; }

        /// <summary>
        /// Gets or sets the Payment type
        /// </summary>
        public string PaymentType { get; set; }

        #endregion

        #region Custom properties

        /// <summary>
        /// Gets or sets the order status
        /// </summary>
        public OrderStatus OrderStatus
        {
            get
            {
                return (OrderStatus)this.OrderStatusId;
            }
            set
            {
                this.OrderStatusId = (int)value;
            }
        }

        /// <summary>
        /// Gets or sets the payment status
        /// </summary>
        public PaymentStatus PaymentStatus
        {
            get
            {
                return (PaymentStatus)this.PaymentStatusId;
            }
            set
            {
                this.PaymentStatusId = (int)value;
            }
        }

        /// <summary>
        /// Gets or sets the shipping status
        /// </summary>
        public ShippingStatus ShippingStatus
        {
            get
            {
                return (ShippingStatus)this.ShippingStatusId;
            }
            set
            {
                this.ShippingStatusId = (int)value;
            }
        }

        /// <summary>
        /// Gets or sets the customer tax display type
        /// </summary>
        public TaxDisplayType CustomerTaxDisplayType
        {
            get
            {
                return (TaxDisplayType)this.CustomerTaxDisplayTypeId;
            }
            set
            {
                this.CustomerTaxDisplayTypeId = (int)value;
            }
        }

        public QRCodeDetails QRCodeDetails { get; set; }
        public string OrderComment { get; set; }
        public string DeliveryType { get; set; }
        public string DeliveryTime { get; set; }
        public decimal DeliveryFees { get; set; }
        public Address DeliveryAddress { get; set; }
        public AdditionalOrderDetails AdditionalOrderDetails { get; set; }

        /// <summary>
        /// Order Id of the 3rd Party provider
        /// </summary>
        public string ExternalOrderId { get; set; }

        #endregion

        public Order()
        {
            OrderItems = new List<OrderItem>();
            QRCodeDetails = new QRCodeDetails();
        }
    }

    public class AdditionalOrderDetails
    {
        public string? PaymentMethodType { get; set; }
        public string? PhoneNumber { get; set; }
        public string? EmailAddress { get; set; }
        public string? StoreName { get; set; }
        public string? StoreAddress { get; set; }
        public string? StorePhoneNumber { get; set; }
        public List<OrderItems>? OrderItems { get; set; }
        /// <summary>
        /// Order latitude
        /// </summary>
        public string? GeoLong { get; set; }
        /// <summary>
        /// Order Longitude
        /// </summary>
        public string? GeoLat { get; set; }
        /// <summary>
        /// Order UserAgent
        /// </summary>
        public string? UserAgent { get; set; }
        /// <summary>
        /// Order IPAddress
        /// </summary>
        public string? IpAddress { get; set; }
        /// <summary>
        /// Order Card last digits
        /// </summary>
        public string? OrderCardLast4Digits { get; set; }
        /// <summary>
        /// Order Card Brand
        /// </summary>
        public string? OrderCardBrand { get; set; }
    }

    public class OrderItems
    {
        public string? ProductId { get; set; }
        public string? ProductName { get; set; }
        public List<ProductAttributes>? Attributes { get; set; }
        public decimal ItemAmount { get; set; }
        public int Quantity { get; set; }
    }

    public class ProductAttributes
    {
        public string? AttributeId { get; set; }
        public string? Name { get; set; }
    }
}
