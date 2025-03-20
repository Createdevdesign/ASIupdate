using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Store
{
    /// <summary>
    /// Represents a product picture mapping
    /// </summary>
    [DataContract]
    public class ProductPictureDto
    {
        /// <summary>
        /// Gets or sets the product identifier
        /// </summary>
        [DataMember]
        public string ProductId { get; set; }

        /// <summary>
        /// Gets or sets the picture identifier
        /// </summary>
        [DataMember]
        public string PictureId { get; set; }

        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        [DataMember]
        public int DisplayOrder { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [DataMember]
        public string MimeType { get; set; }

        /// <summary>
        /// Gets or sets the SEO friednly filename of the picture
        /// </summary>
        [DataMember]
        public string SeoFilename { get; set; }

        /// <summary>
        /// Gets or sets the "alt" attribute for "img" HTML element. If empty, then a default rule will be used (e.g. product name)
        /// </summary>
        [DataMember]
        public string AltAttribute { get; set; }

        /// <summary>
        /// Gets or sets the "title" attribute for "img" HTML element. If empty, then a default rule will be used (e.g. product name)
        /// </summary>
        [DataMember]
        public string TitleAttribute { get; set; }

    }
}
