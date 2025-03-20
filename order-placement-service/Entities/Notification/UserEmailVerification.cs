
using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Entities.Notification
{
    public class UserEmailVerification : BaseEntity
    {
        public string CustomerId { get; set; }
        public string Token { get; set; }
        public string Email { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public bool IsVerified { get; set; }

    }
}
