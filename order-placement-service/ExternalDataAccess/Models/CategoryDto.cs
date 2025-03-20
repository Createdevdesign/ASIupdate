using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.ExternalDataAccess.Models
{
    [DataContract]
    public class CategoryDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public string Description { get; set; }
        [DataMember]
        public string SeName { get; set; }
        [DataMember]
        public string PictureId { get; set; }
        [DataMember]
        public int DisplayOrder { get; set; }
        [DataMember]
        public string Flag { get; set; }
        [DataMember]
        public List<string> Stores { get; set; }
        [DataMember]
        public DateTime CreatedOnUtc { get; set; }
        [DataMember]
        public DateTime UpdatedOnUtc { get; set; }
        [DataMember]
        public string ExternalCategoryId { get; set; }
    }
}
