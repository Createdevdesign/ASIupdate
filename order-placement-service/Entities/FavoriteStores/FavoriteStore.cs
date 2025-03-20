
using System.Collections.Generic;

namespace order_placement_service.Entities.FavoriteStores
{
    /// <summary>
    /// Represent a FavoriteStore
    /// </summary>
    public class FavoriteStore : BaseEntity
    {
        //private ICollection<Store> _stores;

        /// <summary>
        /// Gets or sets the username
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Gets or sets the Favourite store
        /// </summary>
        public List<Store> Stores { get; set; }
    }
}
