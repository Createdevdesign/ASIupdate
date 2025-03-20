

namespace order_placement_service.Entities.Countries
{
    /// <summary>
    /// Represents a country
    /// </summary>
    public class Country: BaseEntity
    {
        /// <summary>
        /// Gets or sets the name
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Gets or sets allow billing
        /// </summary>
        public bool AllowBilling { get; set; }

        /// <summary>
        /// Gets or sets allow shipping
        /// </summary>
        public bool AllowShipping { get; set; }

        /// <summary>
        /// Gets or sets TwoLetterIsoCode
        /// </summary>
        public string? TwoLetterIsoCode { get; set; }

        /// <summary>
        /// Gets or sets ThreeLetterIsoCode
        /// </summary>
        public string? ThreeLetterIsoCode { get; set; }

        /// <summary>
        /// Gets or sets NumericIsoCode
        /// </summary>
        public int NumericIsoCode { get; set; }

        /// <summary>
        /// Gets or sets SubjectToVat
        /// </summary>
        public bool SubjectToVat { get; set; }

        /// <summary>
        /// Gets or sets Published
        /// </summary>
        public bool Published { get; set; }
    }
}
