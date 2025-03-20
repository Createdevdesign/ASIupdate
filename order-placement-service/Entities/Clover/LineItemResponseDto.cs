using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Entities.Clover
{
    public class OrderRef
    {
        public string? id { get; set; }
    }

    public class LineItemResponseDto
    {
        public string? id { get; set; }
        public OrderRef? orderRef { get; set; }
        public Items? item { get; set; }
        public string? name { get; set; }
        public string? alternateName { get; set; }
        public int price { get; set; }
        public string? itemCode { get; set; }
        public bool printed { get; set; }
        public long createdTime { get; set; }
        public long orderClientCreatedTime { get; set; }
        public bool exchanged { get; set; }
        public bool refunded { get; set; }
        public bool isRevenue { get; set; }
    }
}
