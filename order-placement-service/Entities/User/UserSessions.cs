
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Text.Json.Serialization;

namespace order_placement_service.Entities.User
{
    public class UserSessions : BaseEntity
    {
        public string UserName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUpdatedDate { get; set; }
        public List<Session>? Sessions { get; set; }
    }

    public class Session
    {
        public string DeviceId { get; set; }
        public string DeviceType { get; set; }
        public string OS { get; set; }
        public Guid RefreshTokenId { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUpdatedDate { get; set; }
    }
}
