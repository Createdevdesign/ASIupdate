using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.ExternalDataAccess.Models
{
    public class LineItemDto
    {
        public LineItemDto()
        {
            Modifiers = new List<ModifierDto>();
        }
        public string LineItemId { get; set; }
        public int Quantity { get; set; }
        public string Note { get; set; }
        public List<ModifierDto> Modifiers { get; set; }
    }
}
