using System.Collections.Generic;

/// <summary>
/// Not in use right now
/// </summary>
namespace order_placement_service.Entities.Clover
{
    public class TaxRates : BaseEntity
    {
        public List<TaxRatesElement>? Elements { get; set; }
    }

    public class TaxRatesElement
    {
        public string? Id { get; set; }
        public object? LineItemRef { get; set; }
        public string? Name { get; set; }
        public object? TaxType { get; set; }
        public int Rate { get; set; }
        public bool IsDefault { get; set; }
        public object? TaxAmount { get; set; }
        public object? DeletedTime { get; set; }
        public object? ModifiedTime { get; set; }
    }


}
