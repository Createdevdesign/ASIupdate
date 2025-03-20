using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Store
{
    [DataContract]
    public class StoreDto
    {
        [DataMember]
        public string Id { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string CompanyName { get; set; }

        [DataMember]
        public string CompanyAddress { get; set; }

        [DataMember]
        public string CompanyPhoneNumber { get; set; }

        [DataMember]
        public string CompanyEmail { get; set; }

        [DataMember]
        public string CompanyHours { get; set; }
        [DataMember]
        public bool IsDefault { get; set; }
        [DataMember]
        public string LogoUrl { get; set; }
        [DataMember]
        public bool IsOpen { get; set; }
        [DataMember]
        public AdditioanlPaymentOptionsDto AdditioanlPaymentOptions { get; set; }
        [DataMember]
        public bool PayAtStore { get; set; }
        [DataMember]
        public ConfigurationDto Configuration { get; set; }
    }

    [DataContract]
    public class AdditioanlPaymentOptionsDto
    {
        public AdditioanlPaymentOptionsDto()
        {
            PaymentOptions = new List<string>();
        }
        [DataMember]
        public List<string> PaymentOptions { get; set; }
    }

    [DataContract]
    public class ConfigurationDto
    {
        [DataMember]
        public bool IsDelivery { get; set; }
        [DataMember]
        public bool IsPickUp { get; set; }
        //[DataMember]
        //public int PickupCalendarDays { get; set; }
        //[DataMember]
        //public bool SupportsDelivery { get; set; }
        //[DataMember]
        //public int DeliveryCalendarDays { get; set; }
        //[DataMember]
        //public int DeliveryTimeInterval { get; set; }
        //[DataMember]
        //public List<DeliveryFeesByPostalCodeDto> DeliveryFeesByPostalCode { get; set; }
        //[DataMember]
        //public List<DeliveryFeesByRadiusDto> DeliveryFeesByRadius { get; set; }
    }

    [DataContract]
    public class DeliveryFeesByRadiusDto
    {
        [DataMember]
        public RangeDto Radius { get; set; }
        [DataMember]
        public int Charge { get; set; }
        [DataMember]
        public RangeDto CartAmount { get; set; }
    }

    [DataContract]
    public class DeliveryFeesByPostalCodeDto
    {
        [DataMember]
        public List<int> PostalCodes { get; set; }
        [DataMember]
        public int Charge { get; set; }
        [DataMember]
        public RangeDto CartAmount { get; set; }
    }

    [DataContract]
    public class RangeDto
    {
        [DataMember]
        public int Min { get; set; }
        [DataMember]
        public int Max { get; set; }
    }
}
