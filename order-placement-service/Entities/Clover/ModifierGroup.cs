using System.Collections.Generic;

namespace order_placement_service.Entities.Clover
{
    public class ModifierGroup : BaseEntity
    {
        public ModifierGroup()
        {
            Elements = new List<ModifierGroupElement>();
        }

        public List<ModifierGroupElement> Elements { get; set; }
    }

    public class ModifierGroupElement
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? AlternateName { get; set; }
        public object? MinRequired { get; set; }
        public object? MaxAllowed { get; set; }
        public bool ShowByDefault { get; set; }
        public string? ModifierIds { get; set; }
        public object? MenuModifierGroup { get; set; }
        public object? SortOrder { get; set; }
    }




}
