using System.Collections.Generic;
using System.Runtime.Serialization;

namespace SwiftServe.OrderService.WebApi.Model.Store.Store
{
    [DataContract]
    public class DeliveryPickUpScheduleDto
    {
        public DeliveryPickUpScheduleDto()
        {
            PickUpSchedules = new List<DeliveryPickUpSchedule>();
            DeliverySchedules = new List<DeliveryPickUpSchedule>();
        }

        [DataMember]
        public List<DeliveryPickUpSchedule> PickUpSchedules { get; set; }
        [DataMember]
        public List<DeliveryPickUpSchedule> DeliverySchedules { get; set; }
    }

    [DataContract]
    public class DeliveryPickUpSchedule
    {
        [DataMember]
        public string Date { get; set; }
        [DataMember]
        public List<string> Time { get; set; }
    }
}
