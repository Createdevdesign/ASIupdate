

using order_placement_service.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.NotificationFacade.Email
{
    public class OrderItemDto
    {
        public OrderItemDto()
        {
            ProductAttributes = new List<ProductAttributesDto>();
        }
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public string VendorId { get; set; }
        public string WarehouseId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPriceWithoutDiscInclTax { get; set; }
        public decimal UnitPriceWithoutDiscExclTax { get; set; }
        public decimal UnitPriceInclTax { get; set; }
        public decimal UnitPriceExclTax { get; set; }
        public decimal PriceInclTax { get; set; }
        public decimal PriceExclTax { get; set; }
        public decimal DiscountAmountInclTax { get; set; }
        public decimal DiscountAmountExclTax { get; set; }
        public decimal OriginalProductCost { get; set; }
        public string AttributeDescription { get; set; }
        public int DownloadCount { get; set; }
        public bool IsDownloadActivated { get; set; }
        public string LicenseDownloadId { get; set; }
        public decimal? ItemWeight { get; set; }
        public DateTime? RentalStartDateUtc { get; set; }
        public DateTime? RentalEndDateUtc { get; set; }
        public DateTime CreatedOnUtc { get; set; }
        public decimal Commission { get; set; }

        public string AttributesXml { get; set; }
        public List<ProductAttributesDto> ProductAttributes { get; set; }
    }
}

