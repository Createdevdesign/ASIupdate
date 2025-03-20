using System.Runtime.Serialization;

namespace order_placement_service.Common
{
    [DataContract]
    public class AddressDto
    {
        [DataMember]
        public string? CustomerId { get; set; }

        [DataMember]
        public string? FirstName { get; set; }

        [DataMember]
        public string? LastName { get; set; }

        [DataMember]
        public string? Email { get; set; }

        [DataMember]
        public string? Company { get; set; }

        [DataMember]
        public string? VatNumber { get; set; }

        [DataMember]
        public string? CountryId { get; set; }

        [DataMember]
        public string? StateProvinceId { get; set; }

        [DataMember]
        public string? StateName { get; set; }

        [DataMember]
        public string? City { get; set; }

        [DataMember]
        public string? Address1 { get; set; }

        [DataMember]
        public string? Address2 { get; set; }

        [DataMember]
        public string? ZipPostalCode { get; set; }

        [DataMember]
        public string? PhoneNumber { get; set; }

        [DataMember]
        public CoordinatesDto? Coordinates { get; set; }

        [DataMember]
        public string? FaxNumber { get; set; }

        [DataMember]
        public string? CustomAttributes { get; set; }

    }

    [DataContract]
    public class CoordinatesDto
    {
        [DataMember]
        public string? lat { get; set; }
        [DataMember]
        public string? lon { get; set; }
    }
}
