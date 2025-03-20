using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.Store.Store
{
    [DataContract]
    public class GetFilteredStoreResponseDto
    {
        [DataMember]
        public List<StoreDto> Stores { get; set; }
    }
}
