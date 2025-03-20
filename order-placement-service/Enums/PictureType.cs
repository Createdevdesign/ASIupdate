using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    /// <summary>
    /// Represents a picture item type
    /// </summary>
    public enum PictureType
    {
        /// <summary>
        /// Entities (products, categories, manufacturers)
        /// </summary>
        Entity = 1,
        /// <summary>
        /// Avatar
        /// </summary>
        Avatar = 10,
    }
}
