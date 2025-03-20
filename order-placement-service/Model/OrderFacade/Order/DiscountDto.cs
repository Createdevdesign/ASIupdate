using System;
using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade.Order
{
    [DataContract]
    public class DiscountDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string Name { get; set; }
        //[DataMember]
        //public int DiscountTypeId { get; set; }
        [DataMember]
        public bool UsePercentage { get; set; }
        [DataMember]
        public decimal DiscountPercentage { get; set; }
        [DataMember]
        public decimal DiscountAmount { get; set; }
        //[DataMember]
        //public bool CalculateByPlugin { get; set; }
        //[DataMember]
        //public string DiscountPluginName { get; set; }
        [DataMember]
        public decimal? MaximumDiscountAmount { get; set; }
        [DataMember]
        public DateTime? StartDateUtc { get; set; }
        [DataMember]
        public DateTime? EndDateUtc { get; set; }
        [DataMember]
        public bool RequiresCouponCode { get; set; }
        //[DataMember]
        //public bool Reused { get; set; }
        //[DataMember]
        //public bool IsCumulative { get; set; }
        //[DataMember]
        //public int DiscountLimitationId { get; set; }
        [DataMember]
        public int LimitationTimes { get; set; }
        [DataMember]
        public int? MaximumDiscountedQuantity { get; set; }
        [DataMember]
        public bool IsEnabled { get; set; }
        //[DataMember]
        //public bool LimitedToStores { get; set; }
        //[DataMember]
        //public List<string> Stores { get; set; }
        //[DataMember]
        //public DiscountType DiscountType
        //{
        //    get
        //    {
        //        return (DiscountType)this.DiscountTypeId;
        //    }
        //    set
        //    {
        //        this.DiscountTypeId = (int)value;
        //    }
        //}
        //[DataMember]
        //public DiscountLimitationType DiscountLimitation
        //{
        //    get
        //    {
        //        return (DiscountLimitationType)this.DiscountLimitationId;
        //    }
        //    set
        //    {
        //        this.DiscountLimitationId = (int)value;
        //    }
        //}
        //[DataMember]
        //public List<DiscountRequirementDto> DiscountRequirements { get; set; }
    }
}
