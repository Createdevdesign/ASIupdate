using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Model.BusinessBase
{
    public class Credential
    {
        public string BaseUrl { get; set; }
        public string MerchantId { get; set; }
        public string AccessToken { get; set; }
    }
}
