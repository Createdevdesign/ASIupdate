using System.Runtime.Serialization;

namespace SwiftServe.OrderService.WebApi.Model.CustomerFacade
{
    [DataContract]
    public class CustomerRoleDto
    {
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public bool FreeShipping { get; set; }
        [DataMember]
        public bool TaxExempt { get; set; }
        [DataMember]
        public bool Active { get; set; }
        [DataMember]
        public bool IsSystemRole { get; set; }
        [DataMember]
        public string SystemName { get; set; }
        [DataMember]
        public bool EnablePasswordLifetime { get; set; }
    }
}
