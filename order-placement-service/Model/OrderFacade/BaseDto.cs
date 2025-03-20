using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade
{
    [DataContract]
    public class BaseDto
    {
        [DataMember]
        public string? Username { get; set; }
        [DataMember]
        public string? StoreId { get; set; }
    }
}
