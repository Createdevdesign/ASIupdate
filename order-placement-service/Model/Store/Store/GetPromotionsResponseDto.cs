using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Store
{
    [DataContract]
    public class GetPromotionsResponseDto
    {
        [DataMember]
        public List<DiscountDto> Discounts { get; set; }

        public GetPromotionsResponseDto()
        {
            Discounts = new List<DiscountDto>();
        }
    }
}
