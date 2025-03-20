using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Service.AuthService.User
{
    [DataContract]
    public class LogoutResponseDto
    {
        [DataMember]
        public bool Success { get; set; }
    }
}
