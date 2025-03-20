
using order_placement_service.Model.CartFacade.ShoppingCart;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade.Order
{
    [DataContract]
    public class StoreOrderRequestDto : BaseDto
    {
        [DataMember]
        public CustomerModal Customer { get; set; }
        [DataMember]
        public string Source { get; set; }
        [DataMember]
        public DeliveryModal Delivery { get; set; }
        [DataMember]
        public PaymentModal Payment { get; set; }
        [DataMember]
        public string? ExtId { get; set; }
        [DataMember]
        public decimal TipAmount { get; set; }
        [DataMember]
        public string PromoCode { get; set; }
        [DataMember]
        public string PromotionId { get; set; }
        [DataMember]
        public bool PayAtStore { get; set; }
        [DataMember]
        public string? OrderComment { get; set; }
        [DataMember]
        public string? SelectedTime { get; set; }
        [DataMember]
        public string? OrderType { get; set; }
        [DataMember]
        public string? AddressId { get; set; }
        [DataMember]
        public string? GeoLong { get; set; }
        [DataMember]
        public string? GeoLat { get; set; }
        [DataMember]
        public string? UserAgent { get; set; }
        [DataMember]
        public string? IpAddress { get; set; }
        [DataMember]
        public List<CreateCartItemRequestDto> Products { get; set; }

        public StoreOrderRequestDto()
        {
            Customer = new CustomerModal();
            Delivery = new DeliveryModal();
            Payment = new PaymentModal();
            Products = new List<CreateCartItemRequestDto>();
        }
    }

    [DataContract]
    public class CustomerModal
    {
        [DataMember]
        public string? Id { get; set; }
        [DataMember]
        public string? Name { get; set; }
        [DataMember]
        public string? PhoneNumber { get; set; }
        [DataMember]
        public string? Email { get; set; }
    }

    [DataContract]
    public class AddressModal
    {
        [DataMember]
        public string? StateProvinceId { get; set; }
        [DataMember]
        public string? Address1 { get; set; }
        [DataMember]
        public string? Address2 { get; set; }
        [DataMember]
        public string? CountryId { get; set; }
        [DataMember]
        public string? ZipPostalCode { get; set; }
        [DataMember]
        public string? City { get; set; }
    }

    public class DeliveryModal
    {
        public DeliveryModal()
        {
            Address = new AddressModal();
        }

        public string Type { get; set; }
        public DateTime? DeliveryTime { get; set; }
        public AddressModal Address { get; set; }
    }

    public class PaymentModal
    {
        public string? PaymentType { get; set; }
        public string? PaymentIntentId { get; set; }
    }

}
