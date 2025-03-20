using System.Runtime.Serialization;

namespace order.Store
{
    [DataContract]
    public class DeleteFavoriteStoreRequestDto
    {
        [DataMember]
        public string Username { get; set; }
        [DataMember]
        public string Id { get; set; }
    }
}
