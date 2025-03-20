using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.NotificationFacade.Email
{
    public class EmailRequestDto
    {
        public int OrderNumber { get; set; }
        public string CustomerEmail { get; set; }        
        public string StoreEmail { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }

        //public string StoreId { get; set; }
    }
}
