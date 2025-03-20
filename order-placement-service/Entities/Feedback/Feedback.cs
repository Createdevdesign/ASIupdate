
using System;

namespace order_placement_service.Entities.Feedback
{
    public class Feedback : BaseEntity
    {
        public string Username { get; set; }
        public string? Text { get; set; }
        public DateTime CreateDate { get; set; }
    }
}
