

namespace order_placement_service.Entities.Products
{
    /// <summary>
    /// Represents a record to manage product combination tier prices
    /// </summary>
    public partial class ProductCombinationTierPrices : ParentEntity
    {
        /// <summary>
        /// Gets or sets the store identifier
        /// </summary>
        public string StoreId { get; set; }

        /// <summary>
        /// Gets or sets the customer role identifier
        /// </summary>
        public string CustomerRoleId { get; set; }

        /// <summary>
        /// Gets or sets the quantity
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// Gets or sets the price
        /// </summary>
        public decimal Price { get; set; }

    }
}
