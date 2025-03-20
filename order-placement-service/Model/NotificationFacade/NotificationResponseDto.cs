using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.NotificationFacade
{
    public class NotificationResponseDto
    {
        public bool IsSMSSent { get; set; }
        public bool IsEmailSend { get; set; }
        public bool IsEmailSendToStore { get; set; }
    }
}
