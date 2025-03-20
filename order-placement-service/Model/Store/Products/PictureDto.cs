using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    [DataContract]
    public class PictureDto
    {
        [DataMember]
        public string  Id { get; set; }
        //[DataMember]
        //public byte[] PictureBinary { get; set; }
        [DataMember]
        public string MimeType { get; set; }
        [DataMember]
        public string SeoFilename { get; set; }
        [DataMember]
        public string PictureUrl { get; set; }
    }
}
