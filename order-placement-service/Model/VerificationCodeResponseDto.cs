
using order_placement_service.Model.BusinessBase;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model
{
    [DataContract]
    public class VerificationCodeResponseDto : BaseDto
    {
        [DataMember]
        public string Carrier { get; set; }
        [DataMember]
        public bool Is_Cellphone { get; set; }
        [DataMember]
        public string Message { get; set; }
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
    [DataContract]
    public class Error
    {
        [DataMember]
        public string Message { get; set; }
    }
}
