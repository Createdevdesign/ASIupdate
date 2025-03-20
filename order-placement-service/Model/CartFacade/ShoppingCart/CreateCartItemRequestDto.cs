


using order_placement_service.Enums;
using System;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CartFacade.ShoppingCart
{
    [DataContract]
    public class CreateCartItemRequestDto : BaseDto
    {
        [DataMember]
        public int ShoppingCartTypeId { get; set; }
        [DataMember]
        public string? ProductId { get; set; }
        [DataMember]
        public int Quantity { get; set; }
        [DataMember]
        public DateTime? CreatedOnUtc { get; set; }
        [DataMember]
        public DateTime? UpdatedOnUtc { get; set; }
        [DataMember]
        public ShoppingCartType ShoppingCartType
        {
            get
            {
                return (ShoppingCartType)this.ShoppingCartTypeId;
            }
            set
            {
                this.ShoppingCartTypeId = (int)value;
            }
        }
        [DataMember]
        public string? ReservationId { get; set; }
        [DataMember]
        public string? Parameter { get; set; }
        [DataMember]
        public string? Duration { get; set; }
        [DataMember]
        public string? AdditionalComments { get; set; }
        [DataMember]
        public Attributes? Attributes { get; set; }
        [DataMember]
        public string? OrderType { get; set; }
        [DataMember]
        public string? DeliveryTime { get; set; }
    }
}
