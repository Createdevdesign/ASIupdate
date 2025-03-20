using System.Collections.Generic;
using System.Runtime.Serialization;

namespace order_placement_service.Model.OrderFacade.Order
{
    [DataContract]
    public class PlaceOrderResultDto
    {
        /// <summary>
        /// Ctor
        /// </summary>]
        public PlaceOrderResultDto()
        {
            Errors = new List<string>();
        }

        /// <summary>
        /// Gets a value indicating whether request has been completed successfully
        /// </summary>
        [DataMember]
        public bool Success
        {
            get { return (Errors.Count == 0); }
        }

        /// <summary>
        /// Add error
        /// </summary>
        /// <param name="error">Error</param>
        public void AddError(string error)
        {
            Errors.Add(error);
        }

        /// <summary>
        /// Errors
        /// </summary>
        [DataMember]
        public IList<string> Errors { get; set; }

        /// <summary>
        /// Gets or sets the placed order
        /// </summary>
        [DataMember]
        public OrderDto PlacedOrder { get; set; }
    }
}
