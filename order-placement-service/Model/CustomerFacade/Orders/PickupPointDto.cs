

using order_placement_service.Common;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Orders
{
    [DataContract]
    public class PickupPointDto
    {
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public string Description { get; set; }
        [DataMember]
        public string AdminComment { get; set; }
        [DataMember]
        public AddressDto Address { get; set; }
        [DataMember]
        public string WarehouseId { get; set; }
        [DataMember]
        public string StoreId { get; set; }
        [DataMember]
        public decimal PickupFee { get; set; }
        [DataMember]
        public int DisplayOrder { get; set; }
    }
}
