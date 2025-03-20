using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    [DataContract]
    public class GetProductDetailsResponseDto
    {
        [DataMember]
        public ProductDto Product { get; set; }
    }
}
