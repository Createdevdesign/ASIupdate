using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.NotificationFacade.Sms
{
    public class SMSRequestDto
    {
        public string Mobile { get; set; }
        public string CountryCode { get; set; }
        public string Message { get; set; }
        public string UseName { get; set; }
        public string OrderNo { get; set; }
      
    }
}
