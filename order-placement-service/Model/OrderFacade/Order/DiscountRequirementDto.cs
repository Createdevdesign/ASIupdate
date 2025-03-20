using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade.Order
{
    [DataContract]
    public class DiscountRequirementDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string DiscountId { get; set; }
        [DataMember]
        public string DiscountRequirementRuleSystemName { get; set; }
    }
}
