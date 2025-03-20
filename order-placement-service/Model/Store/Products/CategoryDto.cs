using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Products
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
        public string CategoryTemplateId { get; set; }
        [DataMember]
        public string MetaKeywords { get; set; }
        [DataMember]
        public string MetaDescription { get; set; }
        [DataMember]
        public string MetaTitle { get; set; }
        [DataMember]
        public string SeName { get; set; }
        [DataMember]
        public string ParentCategoryId { get; set; }
        [DataMember]
        public string PictureId { get; set; }
        [DataMember]
        public int PageSize { get; set; }
        [DataMember]
        public bool AllowCustomersToSelectPageSize { get; set; }
        [DataMember]
        public string PageSizeOptions { get; set; }
        [DataMember]
        public string PriceRanges { get; set; }
        [DataMember]
        public bool ShowOnHomePage { get; set; }
        [DataMember]
        public bool FeaturedProductsOnHomaPage { get; set; }
        [DataMember]
        public bool IncludeInTopMenu { get; set; }
        [DataMember]
        public bool Published { get; set; }
        [DataMember]
        public int DisplayOrder { get; set; }
        [DataMember]
        public string Flag { get; set; }
        [DataMember]
        public string FlagStyle { get; set; }
        [DataMember]
        public string Icon { get; set; }
        [DataMember]
        public bool HideOnCatalog { get; set; }
        [DataMember]
        public bool ShowOnSearchBox { get; set; }
        [DataMember]
        public int SearchBoxDisplayOrder { get; set; }
    }
}
