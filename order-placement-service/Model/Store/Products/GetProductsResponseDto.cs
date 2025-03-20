
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    [DataContract]
    public class GetProductsResponseDto
    {
        [DataMember]
        public List<ProductDto> Products { get; set; }

        public GetProductsResponseDto()
        {
            Products = new List<ProductDto>();
        }
    }
}
