﻿using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace order_placement_service.Model.CustomerFacade.Customer
{
    [DataContract]
    public class UserEmailRequestDto
    {
        [DataMember]
        public string UserName { get; set; }
    }
}
