using System.Runtime.Serialization;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class SavefeedbackResponseDto
    {
        [DataMember]
        public string Text { get; set; }
    }
}
