using System.Collections.Generic;

namespace order_placement_service.Entities.Clover
{

    public class Modifiers : BaseEntity
    {
        public Modifiers()
        {
            Elements = new List<ModifiersElement>();
        }

        public List<ModifiersElement> Elements { get; set; }
    }

    public class ModifierGroupId
    {
        public string? Id { get; set; }
    }

    public class ModifiersElement
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? AlternateName { get; set; }
        public int Price { get; set; }
        public ModifierGroupId? ModifierGroup { get; set; }
        public object? MenuModifier { get; set; }
    }



}
