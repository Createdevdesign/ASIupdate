namespace order_placement_service.Model.Consumerpayment
{
    public class TransactionLineItem
    {
        public string ProductCode { get; set; }
        public string UnitOfMeasure { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? UnitTaxAmount { get; set; }
        public string CommodityCode { get; set; }
        public decimal? UnitAmount { get; set; }
        public string Description { get; set; }
        public string Name { get; set; }
        public decimal? Quantity { get; set; }
        public LineItemType LineItemKind { get; set; }
        public string Url { get; set; }
    }

    public enum LineItemType
    {
        Credit,
        Debit
    }
}
