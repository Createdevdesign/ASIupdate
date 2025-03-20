
using order_placement_service.Model.BusinessBase;

using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.ExternalDataAccess.Models
{
    public class CloverOrderDto
    {
        public CloverOrderDto()
        {
            credential = new Credential();
        }
        public Credential credential { get; set; }
        public List<LineItemDto> LineItems { get; set; }
    }
}
