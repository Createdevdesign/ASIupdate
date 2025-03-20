namespace order_placement_service.Entities.Clover
{
    public class Item
    {
        public string? id { get; set; }
    }

    public class LineItemRequestDto
    {
        public Item? item { get; set; }
        public string? note { get; set; }
    }
}
