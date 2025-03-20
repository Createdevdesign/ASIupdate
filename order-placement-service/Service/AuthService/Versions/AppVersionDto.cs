using System.Runtime.Serialization;

namespace order_placement_service.Service.AuthService.Versions
{
    [DataContract]
    public class AppVersionDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string Version { get; set; }
        [DataMember]
        public string Description { get; set; }
        [DataMember]
        public string AndroidAppUrl { get; set; }
        [DataMember]
        public string IosAppUrl { get; set; }
        [DataMember]
        public string Title { get; set; }
        [DataMember]
        public string AndroidVersion { get; set; }
        [DataMember]
        public string IosVersion { get; set; }
    }
}
