using System.Runtime.Serialization;

namespace order_placement_service.Model.CartFacade
{
    [DataContract]
    public class BaseDto
    {
        [DataMember]
        public string? UserName { get; set; }
        [DataMember]
        public string? StoreId { get; set; }
    }
}
