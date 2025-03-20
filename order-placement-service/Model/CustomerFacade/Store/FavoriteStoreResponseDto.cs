using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Store
{
    [DataContract]
    public class FavoriteStoreResponseDto
    {
        [DataMember]
        public List<StoreDto> Stores { get; set; }
    }
}
