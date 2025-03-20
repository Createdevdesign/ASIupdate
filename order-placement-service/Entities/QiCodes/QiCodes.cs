
using System;

namespace order_placement_service.Entities.QiCodes
{
    public class QiCodes : BaseEntity
    {
        /// <summary>
        /// ext Id
        /// </summary>
        public string ExtId { get; set; }
        /// <summary>
        /// contains store Id
        /// </summary>
        public string StoreId { get; set; }
        /// <summary>
        /// Table/Spot etc
        /// </summary>
        public string Type { get; set; }
        /// <summary>
        /// will contain a number that represents table number or parking number or anything else
        /// </summary>
        public int Metadata { get; set; }
        /// <summary>
        /// CreateDate
        /// </summary>
        public DateTime CreatedDt { get; set; }
        /// <summary>
        /// Id of the user who created
        /// </summary>
        public string CreatedBy { get; set; }
        /// <summary>
        /// Get od sets display text
        /// </summary>
        public string DisplayText { get; set; }
    }
}
