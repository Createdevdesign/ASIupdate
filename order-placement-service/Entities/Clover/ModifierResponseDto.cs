using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Entities.Clover
{
   
    public class LineItemRef
    {
        public string? id { get; set; }
    }

    public class Modifier
    {
        public string? id { get; set; }
    }

    public class ModifierResponseDto
    {
        public string? id { get; set; }
        public LineItemRef? lineItemRef { get; set; }
        public string? name { get; set; }
        public int amount { get; set; }
        public Modifier? modifier { get; set; }
    }
}
