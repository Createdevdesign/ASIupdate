using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Store
{
    [DataContract]
    public class FavoriteStoreRequestDto
    {
        [DataMember]
        public string Username { get; set; }
        [DataMember]
        public StoreDto Store { get; set; }
    }
}
