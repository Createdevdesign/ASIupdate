

using order_placement_service.Common;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
{
    [DataContract]
    public class ProductDto
    {
        public ProductDto()
        {
            ProductCategories = new List<ProductCategoryDto>();
            ProductAttributes = new List<ProductAttributesDto>();
            ProductSpecificationAttributes = new List<ProductSpecificationDto>();
        }

        /// <summary>
        /// Gets or sets the product Id
        /// </summary>
        [DataMember]
        public string Id { get; set; }
        /// <summary>
        /// Gets or sets the product type identifier
        /// </summary>
        [DataMember]
        public int ProductTypeId { get; set; }
        /// <summary>
        /// Gets or sets the name
        /// </summary>
        [DataMember]
        public string Name { get; set; }
        /// <summary>
        /// Gets or sets the short description
        /// </summary>
        [DataMember]
        public string ShortDescription { get; set; }
        /// <summary>
        /// Gets or sets the full description
        /// </summary>
        [DataMember]
        public string FullDescription { get; set; }
        /// <summary>
        /// Gets or sets the price
        /// </summary>
        [DataMember]
        public decimal Price { get; set; }
        /// <summary>
        /// Gets or sets the collection of ProductCategory
        /// </summary>
        [DataMember]
        public List<ProductCategoryDto> ProductCategories { get; set; }
        /// <summary>
        /// Gets or sets the collection of ProductPicture
        /// </summary>
        [DataMember]
        public string PictureUrl { get; set; }
        /// <summary>
        /// gets or sets ProductAttributes
        /// </summary>
        [DataMember]
        public List<ProductAttributesDto> ProductAttributes { get; set; }
        /// <summary>
        /// gets or sets ProductSpecificationAttributes
        /// </summary>
        [DataMember]
        public List<ProductSpecificationDto> ProductSpecificationAttributes { get; set; }
    }
}
