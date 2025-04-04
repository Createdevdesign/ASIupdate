﻿
using order_placement_service.Entities.Products;
using System.Collections.Generic;

namespace order_placement_service.Entities.Customers
{
    /// <summary>
    /// Represents a state/province
    /// </summary>
    public partial class StateProvince : BaseEntity
    {
        public StateProvince()
        {
            Locales = new List<LocalizedProperty>();
        }
        /// <summary>
        /// Gets or sets the country identifier
        /// </summary>
        public string? CountryId { get; set; }

        /// <summary>
        /// Gets or sets the name
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Gets or sets the abbreviation
        /// </summary>
        public string? Abbreviation { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the entity is published
        /// </summary>
        public bool? Published { get; set; }

        /// <summary>
        /// Gets or sets the display order
        /// </summary>
        public int DisplayOrder { get; set; }

        /// <summary>
        /// Gets or sets the collection of locales
        /// </summary>
        public IList<LocalizedProperty> Locales { get; set; }
    }
}
