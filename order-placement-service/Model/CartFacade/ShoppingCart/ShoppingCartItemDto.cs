

using order_placement_service.Common;
using order_placement_service.Enums;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CartFacade.ShoppingCart
{
    [DataContract]
    public class ShoppingCartItemDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string? StoreId { get; set; }
        [DataMember]
        public int ShoppingCartTypeId { get; set; }
        [DataMember]
        public string? ProductId { get; set; }
        [DataMember]
        public string AttributesXml { get; set; }
        [DataMember]
        public int Quantity { get; set; }
        [DataMember]
        public decimal Price { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public decimal TotalProductPrice { get; set; }
        [DataMember]
        public DateTime CreatedOnUtc { get; set; }
        [DataMember]
        public DateTime UpdatedOnUtc { get; set; }
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
        public string Duration { get; set; }
        [DataMember]
        public string AdditionalComments { get; set; }
        [DataMember]
        public List<ProductAttributesDto> ProductAttributes { get; set; }
        [DataMember]
        public string OrderType { get; set; }
        [DataMember]
        public string DeliveryTime { get; set; }
    }
}
