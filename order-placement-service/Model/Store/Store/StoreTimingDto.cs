using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.Store.Store
{
    [DataContract]
    public class StoreTimingDto
    {
        [DataMember]
        public List<ScheduleDto> Open { get; set; }
        [DataMember]
        public List<ScheduleDto> Delivery { get; set; }
        [DataMember]
        public List<ClosedDays> ClosedDays { get; set; }
        [DataMember]
        public string TimeZone { get; set; }
    }

    [DataContract]
    public class ScheduleDto
    {
        [DataMember]
        public string StartTime { get; set; }
        [DataMember]
        public string Endtime { get; set; }
        [DataMember]
        public DayOfWeek Day { get; set; }
        [DataMember]
        public string Description { get; set; }
    }

    [DataContract]
    public class ClosedDays
    {
        [DataMember]
        public string Description { get; set; }
        [DataMember]
        public DateTime Date { get; set; }
    }
}
