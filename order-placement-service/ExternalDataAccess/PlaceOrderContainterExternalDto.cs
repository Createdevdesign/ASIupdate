using order_placement_service.ExternalDataAccess.Models;

using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.ExternalDataAccess
{
    public class PlaceOrderContainterExternalDto
    {

        public PlaceOrderContainterExternalDto()
        {
            Cart = new List<ShoppingCartItemExternalDto>();
            AppliedDiscounts = new List<AppliedDiscountExternalDto>();
            AppliedGiftCards = new List<AppliedGiftCardExternalDto>();
        }

        //public Customer Customer { get; set; }
        ////public Language CustomerLanguage { get; set; }
        public string AffiliateId { get; set; }
       // public TaxDisplayType CustomerTaxDisplayType { get; set; }
        public string CustomerCurrencyCode { get; set; }
        public decimal CustomerCurrencyRate { get; set; }
        public string PrimaryCurrencyCode { get; set; }
        //public Language CustomerLanguage { get; set; }
        //public Address BillingAddress { get; set; }
        //public Address ShippingAddress { get; set; }
        //public ShippingStatus ShippingStatus { get; set; }
        public string ShippingMethodName { get; set; }
        public string ShippingRateComputationMethodSystemName { get; set; }
        public bool PickUpInStore { get; set; }
       // public PickupPoint PickupPoint { get; set; }
        public bool IsRecurringShoppingCart { get; set; }
        //initial order (used with recurring payments)
        public OrderExternalDto InitialOrder { get; set; }

        public string CheckoutAttributeDescription { get; set; }
        public string CheckoutAttributesXml { get; set; }

        public IList<ShoppingCartItemExternalDto> Cart { get; set; }
        public List<AppliedDiscountExternalDto> AppliedDiscounts { get; set; }
        public List<AppliedGiftCardExternalDto> AppliedGiftCards { get; set; }

        public decimal OrderSubTotalInclTax { get; set; }
        public decimal OrderSubTotalExclTax { get; set; }
        public decimal OrderSubTotalDiscountInclTax { get; set; }
        public decimal OrderSubTotalDiscountExclTax { get; set; }
        public decimal OrderShippingTotalInclTax { get; set; }
        public decimal OrderShippingTotalExclTax { get; set; }
        public decimal PaymentAdditionalFeeInclTax { get; set; }
        public decimal PaymentAdditionalFeeExclTax { get; set; }
        public decimal OrderTaxTotal { get; set; }
        public string TaxRates { get; set; }
        public decimal OrderDiscountAmount { get; set; }
        public int RedeemedRewardPoints { get; set; }
        public decimal RedeemedRewardPointsAmount { get; set; }
        public decimal OrderTotal { get; set; }
    }
}
