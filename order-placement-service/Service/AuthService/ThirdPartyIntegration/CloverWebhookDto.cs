using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Service.AuthService.ThirdPartyIntegration
{
    [DataContract]
    public class CloverWebhookDto
    {
        public CloverWebhookDto()
        {
            Merchants = new List<MerchantDto>();
        }

        [DataMember]
        public string VerificationCode { get; set; }
        [DataMember]
        public string CloverAuthCode { get; set; }
        [DataMember]
        public string AppId { get; set; }
        [DataMember]
        public List<MerchantDto> Merchants { get; set; }
    }

    public class MerchantDto
    {
        [DataMember]
        public string MerchantId { get; set; }
        [DataMember]
        public string ObjectId { get; set; }
        [DataMember]
        public string Type { get; set; }
        [DataMember]
        public object Ts { get; set; }
    }
}
