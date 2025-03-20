using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Entities.Clover
{
    
    public class ModifierRequestDto
    {
        public ModifierRequestDto()
        {
            modifier = new Modifier();
        }
        public Modifier modifier { get; set; }
    }
}
