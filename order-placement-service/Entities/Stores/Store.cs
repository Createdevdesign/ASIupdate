
using order_placement_service.Entities.Common;
using order_placement_service.Entities.Countries;
using System;
using System.Collections.Generic;


namespace order_placement_service.Entities.Stores
{
    /// <summary>
    /// Represents a store object
    /// </summary>
    public partial class Store : BaseEntity
    {
        private ICollection<Locale> _locales;

        /// <summary>
        /// Ctor
        /// </summary>
        public Store()
        {
            this.StoreGuid = Guid.NewGuid();
            AdditionalPaymentOptions = new AdditioanlPaymentOptions();
            ThirdPartyConfig = new ThirdPartyConfig();
            Configuration = new Configuration();
        }

        /// <summary>
        /// Gets or sets the store Guid
        /// </summary>
        public Guid StoreGuid { get; set; }

        /// <summary>
        /// Gets or sets the store name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the store shortcut
        /// </summary>
        public string Shortcut { get; set; }

        /// <summary>
        /// Gets or sets the store url
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the ssl enabled flag
        /// </summary>
        public bool SslEnabled { get; set; }

        /// <summary>
        /// Gets or sets the secure url
        /// </summary>
        public string SecureUrl { get; set; }

        /// <summary>
        /// Gets or sets the hosts
        /// </summary>
        public string Hosts { get; set; }

        /// <summary>
        /// Gets or sets the default language id 
        /// </summary>
        public string DefaultLanguageId { get; set; }

        /// <summary>
        /// Gets or sets the default warehouse id 
        /// </summary>
        public string DefaultWarehouseId { get; set; }

        /// <summary>
        /// Gets or sets the default country id 
        /// </summary>
        public string DefaultCountryId { get; set; }

        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        public int DisplayOrder { get; set; }

        /// <summary>
        /// Gets or sets the company name
        /// </summary>
        public string CompanyName { get; set; }

        /// <summary>
        /// Gets or sets the company address
        /// </summary>
        public string CompanyAddress { get; set; }

        /// <summary>
        /// Gets or sets the company phone number
        /// </summary>
        public string CompanyPhoneNumber { get; set; }

        /// <summary>
        /// Gets or sets the company vat
        /// </summary>
        public string CompanyVat { get; set; }

        /// <summary>
        /// Gets or sets the company email
        /// </summary>
        public string CompanyEmail { get; set; }

        /// <summary>
        /// Gets or sets the company hours
        /// </summary>
        public string CompanyHours { get; set; }

        /// <summary>
        /// Gets or sets the IsDefault
        /// </summary>
        public bool IsDefault { get; set; }

        public AdditioanlPaymentOptions AdditionalPaymentOptions { get; set; }

        /// <summary>
        /// Configuration to Keep all the custom configuration for Store
        /// </summary>
        public Configuration Configuration { get; set; }

        public bool PayAtStore { get; set; }

        public ThirdPartyConfig ThirdPartyConfig { get; set; }
        public Address Address { get; set; }

        #region Navigation properties

        /// <summary>
        /// Gets the Locale's of the store
        /// </summary>
        public virtual ICollection<Locale> Locales
        {
            get { return _locales ?? (_locales = new List<Locale>()); }
            protected set { _locales = value; }
        }
        #endregion

    }

    public class AdditioanlPaymentOptions
    {
        public AdditioanlPaymentOptions()
        {
            PaymentOptions = new List<string>();
        }
        public List<string> PaymentOptions { get; set; }
    }

    public class ThirdPartyConfig
    {
        public string IntegrationChannel { get; set; }
        public string MerchantId { get; set; }
        public string AccessToken { get; set; }
        public string BaseUrl { get; set; }
        public bool IsEnabled { get; set; }
        public string AppId { get; set; }
    }

    public class Configuration
    {
        public bool IsDelivery { get; set; }
        public bool IsPickUp { get; set; }
        public int PickupCalendarDays { get; set; }
        public int PickupTimeInterval { get; set; }
        public int DeliveryCalendarDays { get; set; }
        public int DeliveryTimeInterval { get; set; }
        public List<DeliveryFeesByPostalCode> DeliveryFeesByPostalCode { get; set; }
        public List<DeliveryFeesByRadius> DeliveryFeesByRadius { get; set; }
    }

    public class DeliveryFeesByRadius
    {
        public Range Radius { get; set; }
        public decimal Charge { get; set; }
        public Range CartAmount { get; set; }
    }

    public class DeliveryFeesByPostalCode
    {
        public List<string> PostalCodes { get; set; }
        public decimal Charge { get; set; }
        public Range CartAmount { get; set; }
    }

    public class Range
    {
        public decimal Min { get; set; }
        public decimal Max { get; set; }
    }
}
