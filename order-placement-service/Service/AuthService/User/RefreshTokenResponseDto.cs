using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;
using System.Text.Json.Serialization;

namespace order_placement_service.Service.AuthService.User
{
    [DataContract]
    public class RefreshTokenResponseDto
    {
        [DataMember]
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }
        [DataMember]
        [JsonPropertyName("refresh_token")]
        public Guid RefreshToken { get; set; }
    }
}
