using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;
using System.Text.Json.Serialization;

namespace order_placement_service.Service.AuthService.User
{
    [DataContract]
    public class RefreshTokenRequestDto
    {
        [DataMember]
        [JsonPropertyName("refresh_token")]
        public Guid RefreshToken { get; set; }
        [DataMember]
        public string DeviceId { get; set; }
    }
}
