
using System.Collections.Generic;

namespace order_placement_service.Entities.Customers
{
    public class Notification
    {
        public List<string> Notifications { get; set; }

        public Notification()
        {
            Notifications = new List<string>();
        }
    }
}
