using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Service.AuthService.User
{
    [DataContract]
    public class UserSessionDto
    {
        [DataMember]
        public string UserName { get; set; }
        [DataMember]
        public DateTime CreatedDate { get; set; }
        [DataMember]
        public DateTime LastUpdatedDate { get; set; }
        [DataMember]
        public List<SessionDto> Sessions { get; set; }

        public UserSessionDto()
        {
            Sessions = new List<SessionDto>();
        }
    }
    [DataContract]
    public class SessionDto
    {
        [DataMember]
        public string DeviceId { get; set; }
        [DataMember]
        public string DeviceType { get; set; }
        [DataMember]
        public string OS { get; set; }
        [DataMember]
        public Guid RefreshTokenId { get; set; }
        [DataMember]
        public DateTime CreatedDate { get; set; }
        [DataMember]
        public DateTime LastUpdatedDate { get; set; }
    }
}
