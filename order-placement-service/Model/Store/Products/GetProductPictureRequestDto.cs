using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    [DataContract]
    public class GetProductPictureRequestDto : BaseDto
    {
        [DataMember]
        public string PictureId { get; set; }
    }
}
