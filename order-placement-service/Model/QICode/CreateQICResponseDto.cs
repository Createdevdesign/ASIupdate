using System.Runtime.Serialization;

namespace order_placement_service.Model.QICode
{
    [DataContract]
    public class CreateQICResponseDto
    {
        [DataMember]
        public bool Success { get; set; }
        [DataMember]
        public string Message { get; set; }
    }
}
