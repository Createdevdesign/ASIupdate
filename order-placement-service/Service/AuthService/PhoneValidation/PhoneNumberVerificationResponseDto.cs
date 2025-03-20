using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace order_placement_service.Service.AuthService.PhoneValidation
{
    [DataContract]
    public class PhoneNumberVerificationResponseDto
    {
        [DataMember]
        public string Message { get; set; }
        [DataMember]
        public string status { get; set; }
        [DataMember]
        public bool Success { get; set; }
        [DataMember]
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }
        [DataMember]
        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }
        [DataMember]
        public bool IsRegistered { get; set; }
        [DataMember]
        public string DisplayName { get; set; }
        [DataMember]
        public string CustomerId { get; set; }

    }
}
