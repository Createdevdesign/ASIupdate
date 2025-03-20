
using System;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class SaveFeedbackRequestDto : BaseDto
    {
        [DataMember]
        public string Feedback { get; set; }
        [DataMember]
        public DateTime CreateDate { get; set; }
    }
}
