
using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.NotificationFacade
{
    public class NotificationRequestDto
    {
        public int OrderNumber { get; set; }
        //public Order OrderDetails { get; set; }

        public string? Username { get; set; }
        public string? StoreId { get; set; }
        public bool isPayAtStore { get; set; }
        public string? ExtId { get; set; }
        public string? OrderComments { get; set; }
    }
}
