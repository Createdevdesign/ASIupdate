
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    /// <summary>
    /// Represents a generic attribute
    /// </summary>
    public partial class GenericAttributeDto
    {
        [DataMember]
        /// <summary>
        /// Gets or sets the key
        /// </summary>
        public string Key { get; set; }
        [DataMember]
        /// <summary>
        /// Gets or sets the value
        /// </summary>
        public string Value { get; set; }
        [DataMember]
        /// <summary>
        /// Gets or sets the store identifier
        /// </summary>
        public string StoreId { get; set; }

    }
}
