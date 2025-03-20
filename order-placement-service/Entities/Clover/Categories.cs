using System.Collections.Generic;

namespace order_placement_service.Entities.Clover
{
    public class Categories : BaseEntity
    {
        public List<CategoryElement>? Elements { get; set; }
    }

    public class CategoryElement
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public int SortOrder { get; set; }
        public object? Deleted { get; set; }
        public object? ModifiedTime { get; set; }
        public object? Canonical { get; set; }
        public object? MenuSection { get; set; }
    }
}
