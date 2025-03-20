using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.Consumerpayment
{
    public class CardDeleteRequest
    {
        public string Email { get; set; }

        public string CardId { get; set; }
    }
}
