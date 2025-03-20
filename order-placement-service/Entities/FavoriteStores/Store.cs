


namespace order_placement_service.Entities.FavoriteStores
{
    public class Store : BaseEntity
    {
        public string Name { get; set; }
        public string Shortcut { get; set; }
        public string Url { get; set; }
        public bool SslEnabled { get; set; }
        public object SecureUrl { get; set; }
        public string Hosts { get; set; }
        public int DisplayOrder { get; set; }
        public string CompanyName { get; set; }
        public string CompanyAddress { get; set; }
        public string CompanyPhoneNumber { get; set; }
        public object CompanyVat { get; set; }
        public string CompanyEmail { get; set; }
        public string CompanyHours { get; set; }
    }
}
