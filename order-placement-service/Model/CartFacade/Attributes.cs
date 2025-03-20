using System.Collections.Generic;
using System.Xml.Serialization;

namespace order_placement_service.Model.CartFacade
{

    [XmlRoot(ElementName = "Attributes")]
    public class Attributes
    {
        [XmlElement(ElementName = "ProductAttribute")]
        public List<ProductAttribute>? ProductAttribute { get; set; }
    }

    [XmlRoot(ElementName = "ProductAttribute")]
    public class ProductAttribute
    {
        [XmlElement(ElementName = "ProductAttributeValue")]
        public List<ProductAttributeValue>? ProductAttributeValue { get; set; }
        [XmlAttribute(AttributeName = "ID")]
        public string? ID { get; set; }
    }

    [XmlRoot(ElementName = "ProductAttributeValue")]
    public class ProductAttributeValue
    {
        [XmlElement(ElementName = "Value")]
        public string? Value { get; set; }
    }
}
