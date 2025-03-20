using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    [DataContract]
    public class GetProductDetailsRequestDto : BaseDto
    {
        [DataMember]
        public string ProductId { get; set; }
    }
}
