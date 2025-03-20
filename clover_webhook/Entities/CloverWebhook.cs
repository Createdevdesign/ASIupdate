namespace clover_webhook.Entities
{
     public class CloverWebhook : BaseEntity
    {
        public CloverWebhook()
        {
            InsertDate = DateTime.UtcNow;
        }

        public string VerificationCode { get; set; }
        public string CloverAuthCode { get; set; }
        public string AppId { get; set; }
        public DateTime InsertDate { get; set; }
        public List<Merchant> Merchants { get; set; }
    }

    public class Merchant
    {
        public string MerchantId { get; set; }
        public string ObjectId { get; set; }
        public string Type { get; set; }
        public object Ts { get; set; }
    }
}