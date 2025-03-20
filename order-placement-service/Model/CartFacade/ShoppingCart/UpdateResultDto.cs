using MongoDB.Bson;
using System.Runtime.Serialization;

namespace order_placement_service.Model.CartFacade.ShoppingCart
{
    [DataContract]
    public class UpdateResultDto
    {
        [DataMember]
        public bool IsAcknowledged { get; set; }
        [DataMember]
        public bool IsModifiedCountAvailable { get; set; }
        [DataMember]
        public long MatchedCount { get; set; }
        [DataMember]
        public long ModifiedCount { get; set; }
        [DataMember]
        public BsonValue UpsertedId { get; set; }
    }
}
