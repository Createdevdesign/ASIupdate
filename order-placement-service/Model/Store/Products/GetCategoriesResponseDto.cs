using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    [DataContract]
    public class GetCategoriesResponseDto
    {
        [DataMember]
        public List<CategoryDto> Categories { get; set; }
    }
}
