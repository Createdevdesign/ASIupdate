using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;
using System.Text.Json.Serialization;

namespace order_placement_service.Service.AuthService.User
{    
    [DataContract]
    public class LogoutRequestDto : RefreshTokenRequestDto
    {
    }
}
