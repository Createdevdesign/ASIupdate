using System.Collections.Generic;

namespace order_placement_service.Entities.Clover
{

    public class Inventory : BaseEntity
    {
        public List<Items>? Elements { get; set; }
    }

    public class Items
    {
        public string? Id { get; set; }
        public bool Hidden { get; set; }
        public object? ItemGroup { get; set; }
        public string? Name { get; set; }
        public string? AlternateName { get; set; }
        public string? Code { get; set; }
        public string? Sku { get; set; }
        public int Price { get; set; }
        public string? PriceType { get; set; }
        public bool DefaultTaxRates { get; set; }
        public string? UnitName { get; set; }
        public int Cost { get; set; }
        public bool IsRevenue { get; set; }
        public int? StockCount { get; set; }
        public Categories? Categories { get; set; }
        public ModifierGroup? ModifierGroups { get; set; }
        public TaxRates? taxRates { get; set; }
        public object? Canonical { get; set; }
        public object? ItemStock { get; set; }
        public object? MenuItem { get; set; }
        public string? ModifiedTime { get; set; }
        public object? DeletedTime { get; set; }
        public object? PriceWithoutVat { get; set; }
    }


}
