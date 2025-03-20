using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    [DataContract]
    public class GetProductPictureResponseDto
    {
        [DataMember]
        public List<PictureDto> Pictures { get; set; }

        public GetProductPictureResponseDto()
        {
            Pictures = new List<PictureDto>();
        }
    }
}
