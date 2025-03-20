
using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Entities.Countries
{
    /// <summary>
    /// Represents a locale object
    /// </summary>
    public class Locale :BaseEntity
    {
        /// <summary>
        /// Gets or sets the locale id
        /// </summary>
        public string? LocaleId { get; set; }

        /// <summary>
        /// Gets or sets the language id of the locale
        /// </summary>
        public string? LanguageId { get; set; }

        /// <summary>
        /// Gets or sets the resource name of the locale
        /// </summary>
        public string? ResourceName { get; set; }

        /// <summary>
        /// Gets or sets the resource value of the locale
        /// </summary>
        public string? ResourceValue { get; set; }
    }
}
