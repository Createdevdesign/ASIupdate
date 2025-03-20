using System.Runtime.Serialization;


namespace order_placement_service.Model.Store.Store
{
    [DataContract]
    public class GetStoreRequestDto
    {
        [DataMember]
        public string StoreName { get; set; }
    }
}
