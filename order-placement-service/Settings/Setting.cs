﻿using order_placement_service.Entities;
using order_placement_service.Entities.Products;

using System.Collections.Generic;




namespace order_placement_service.Settings
{
    /// <summary>
    /// Represents a setting
    /// </summary>
    public partial class Setting : BaseEntity
    {
        public Setting()
        {
            Locales = new List<LocalizedProperty>();
        }

        public Setting(string name, string value, string storeId = "")
        {
            this.Name = name;
            this.Value = value;
            this.StoreId = storeId;
        }

        /// <summary>
        /// Gets or sets the name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the value
        /// </summary>
        public string Value { get; set; }

        /// <summary>
        /// Gets or sets the store for which this setting is valid. 0 is set when the setting is for all stores
        /// </summary>
        public string StoreId { get; set; }

        /// <summary>
        /// Gets or sets the collection of locales
        /// </summary>
        public IList<LocalizedProperty> Locales { get; set; }

        public override string ToString()
        {
            return Name;
        }
    }
}
