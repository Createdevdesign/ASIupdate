
using order_placement_service.Entities.Clover;
using System.Runtime.Serialization;

namespace order_placement_service.ExternalDataAccess.Models
{
    [DataContract]
    public class GetModifiersDto
    {
        public GetModifiersDto()
        {
            ModifierGroup = new ModifierGroup();
            Modifiers = new Modifiers();
        }

        [DataMember]
        public Modifiers Modifiers { get; set; }
        [DataMember]
        public ModifierGroup ModifierGroup { get; set; }
    }
}
