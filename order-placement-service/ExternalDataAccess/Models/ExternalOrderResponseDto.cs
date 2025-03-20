
namespace order_placement_service.ExternalDataAccess.Models
{
    public class ExternalOrderResponseDto
    {
        public string href { get; set; }
        public string id { get; set; }
        public string currency { get; set; }
        public bool taxRemoved { get; set; }
        public bool isVat { get; set; }
        public bool manualTransaction { get; set; }
        public bool groupLineItems { get; set; }
        public bool testMode { get; set; }
        public long createdTime { get; set; }
        public long clientCreatedTime { get; set; }
        public long modifiedTime { get; set; }
    }
}
