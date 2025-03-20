
using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Model.NotificationFacade.Email
{
    public class RazorEngineDto
    {
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public string StoreName { get; set; }
        public string StoreEmail { get; set; }
        public string StoreContact { get; set; }
        public string StoreAddress { get; set; }
        public string PaymentId { get; set; }
        public int OrderNumber { get; set; }
      //  public string OrderItems { get; set; }

        public List<OrderItemDto> OrderItems { get; set; }
        public string QRCode { get; set; }
        public decimal TipAmount { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Discount { get; set; }
        public DateTime OrderDate { get; set; }
        public string PaymentMessage { get; set; }
        public string ConfirmationMessage { get; set; }
        public string DisplayText { get; set; }
        public string OrderComments { get; set; }
    }
}
