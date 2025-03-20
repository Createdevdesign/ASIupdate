using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.NotificationFacade.Sms
{
    public class SMSResponseDto
    {
        public string MessageId { get; set; }

        public bool IsSMSSent { get; set; }
    }
}
