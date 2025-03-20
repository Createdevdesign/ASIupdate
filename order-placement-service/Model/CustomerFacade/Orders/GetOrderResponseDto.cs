

using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Orders
{
    [DataContract]
    public class GetOrderResponseDto
    {
        [DataMember]
        public List<OrderDto> Orders { get; set; }

        public GetOrderResponseDto()
        {
            Orders = new List<OrderDto>();
        }
    }
}
