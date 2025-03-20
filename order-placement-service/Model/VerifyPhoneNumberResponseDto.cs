using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model
{
    [DataContract]
    public class VerifyPhoneNumberResponseDto
    {
        [DataMember]
        public string Carrier { get; set; }
        [DataMember]
        public bool Is_Cellphone { get; set; }
        [DataMember]
        public string Message { get; set; }
        [DataMember]
        public string status { get; set; }
        [DataMember]
        public int Seconds_To_Expire { get; set; }
        [DataMember]
        public string Uuid { get; set; }
        [DataMember]
        public bool Success { get; set; }
        [DataMember]
        public string error_code { get; set; }
        [DataMember]
        public Error errors { get; set; }
    }
}
