using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Enums
{
    public enum ShoppingCartType
    {
        /// <summary>
        /// Shopping cart
        /// </summary>
        ShoppingCart = 1,
        /// <summary>
        /// Wishlist
        /// </summary>
        Wishlist = 2,
        /// <summary>
        /// Auctions
        /// </summary>
        Auctions = 3,
        /// <summary>
        /// On hold cart
        /// </summary>
        OnHoldCart = 10
    }
}
