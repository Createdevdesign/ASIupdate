using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class NotificationDto
    {
        [DataMember]
        public List<string> Notifications { get; set; }

        public NotificationDto()
        {
            Notifications = new List<string>();
        }
    }
}
