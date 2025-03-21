﻿

namespace order_placement_service.Entities.Products
{
    /// <summary>
    /// Represents a localized property
    /// </summary>
    public partial class LocalizedProperty : ParentEntity
    {
        /// <summary>
        /// Gets or sets the language identifier
        /// </summary>
        public string LanguageId { get; set; }

        /// <summary>
        /// Gets or sets the locale key
        /// </summary>
        public string LocaleKey { get; set; }

        /// <summary>
        /// Gets or sets the locale value
        /// </summary>
        public string LocaleValue { get; set; }

    }
}
