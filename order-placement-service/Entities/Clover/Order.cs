namespace order_placement_service.Entities.Clover
{

    public class Order
    {
        public string? href { get; set; }
        public string? id { get; set; }
        public string? currency { get; set; }
        public Employee? employee { get; set; }
        public int total { get; set; }
        public object? externalReferenceId { get; set; }
        public object? unpaidBalance { get; set; }
        public string? paymentState { get; set; }
        public string? title { get; set; }
        public string? note { get; set; }
        public object? orderType { get; set; }
        public bool taxRemoved { get; set; }
        public bool isVat { get; set; }
        public string? state { get; set; }
        public bool manualTransaction { get; set; }
        public bool groupLineItems { get; set; }
        public bool testMode { get; set; }
        public object? payType { get; set; }
        public long createdTime { get; set; }
        public long clientCreatedTime { get; set; }
        public long modifiedTime { get; set; }
        public object? deletedTimestamp { get; set; }
        public object? serviceCharge { get; set; }
        public Device? device { get; set; }
        public object? merchant { get; set; }
        public object? onlineOrder { get; set; }
    }

    public class Employee
    {
        public string? id { get; set; }
    }

    public class Device
    {
        public string? id { get; set; }
    }
}
