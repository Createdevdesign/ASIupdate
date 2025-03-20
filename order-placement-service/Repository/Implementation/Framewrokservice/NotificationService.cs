using Amazon;
using Amazon.S3;
using AutoMapper;
using Microsoft.Extensions.Options;

using MongoDB.Driver;
using MongoDB.Driver.Linq;
using order_placement_service.Common;
using order_placement_service.Entities.Notification;
using order_placement_service.Entities.Orders;
using order_placement_service.Entities.Products;
using order_placement_service.Entities.QiCodes;
using order_placement_service.Entities.Stores;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Model.CartFacade;
using order_placement_service.Model.CustomerFacade.Customer;
using order_placement_service.Model.NotificationFacade;
using order_placement_service.Model.NotificationFacade.Email;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Repository.Interfaces.CustomerService;
using order_placement_service.Repository.Interfaces.FrameworkService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace order_placement_service.Repository.Implementation.Framewrokservice
{
    public class NotificationService : INotificationService
    {
        private readonly ISMSService _smsService;
        private readonly IEmailService _emailService;
        private readonly ICustomerService _customerService;
        private readonly IRepository<Store> _storerepository;
        private readonly IRepository<UserEmailVerification> _notificationRepository;
        private readonly IRepository<Entities.Products.ProductAttribute> _productAttributeRepository;
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly AppSettings _appSettings;
        private readonly IAmazonS3 _awsS3Client;
        private readonly IMapper _mapper;
        private readonly IRepository<QiCodes> _qicrepository;

        public NotificationService(
             ISMSService smsService,
            IEmailService emailService,
                 ICustomerService customerService,
                 IRepository<Store> storerepository,
                 IRepository<Product> productRepository,
                 IRepository<Order> orderRepository,
                 IOptions<AppSettings> appSettings,
                 IMapper mapper,
                 IRepository<UserEmailVerification> notificationRepository,
                 IRepository<Entities.Products.ProductAttribute> productAttributeRepository,
                 IRepository<QiCodes> qicrepository
            )
        {
            _smsService = smsService;
            _emailService = emailService;
            _customerService = customerService;
            _storerepository = storerepository;
            _appSettings = appSettings.Value;
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _awsS3Client = new AmazonS3Client(_appSettings.AWS.AWSKey, _appSettings.AWS.AWSSecret, RegionEndpoint.USEast2);
            _mapper = mapper;
            _notificationRepository = notificationRepository;
            _productAttributeRepository = productAttributeRepository;
            _qicrepository = qicrepository;

        }

        public async Task<T> Deserialize<T>(string xmlText)
        {
            var stringReader = new System.IO.StringReader(xmlText);
            var serializer = new XmlSerializer(typeof(T));
            return (T)serializer.Deserialize(stringReader);
        }

        public async Task<List<ProductAttributesDto>> ParseProductAttributesFromXml(string xmlToParse, Product product)
        {
            List<ProductAttributesDto> productAttributes = null;
            if (!string.IsNullOrWhiteSpace(xmlToParse))
            {
                productAttributes = new List<ProductAttributesDto>();
                var attributes = await Deserialize<Attributes>(xmlToParse);

                productAttributes = (from prodAttr in product.ProductAttributeMappings
                                     join attr in attributes.ProductAttribute
                                     on prodAttr.Id equals attr.ID
                                     join addAttr in await _productAttributeRepository.Table.ToListAsync()
                                     on prodAttr.ProductAttributeId equals addAttr.Id
                                     select new ProductAttributesDto
                                     {
                                         Id = attr.ID,
                                         ProductAttributeName = addAttr.Name,
                                         ProductAttributeValues = (from value in prodAttr.ProductAttributeValues
                                                                   join attrValue in attr.ProductAttributeValue
                                                                   on value.Id equals attrValue.Value
                                                                   select new ProductAttributeValueDto
                                                                   {
                                                                       Id = value.Id,
                                                                       Cost = value.Cost ?? 0,
                                                                       Name = value.Name,
                                                                       PriceAdjustment = value.PriceAdjustment ?? 0
                                                                   }).ToList()
                                     }).ToList();
            }

            return productAttributes;
        }
        public async Task<NotificationResponseDto> SendNotification(NotificationRequestDto request)
        {
            //if Order came from QR Scan
            var qrCode = string.IsNullOrWhiteSpace(request.ExtId) ? null : _qicrepository.Table.Where(a => a.ExtId.Equals(request.ExtId)).FirstOrDefault();
            var response = new NotificationResponseDto();
            //Get Customer Details
            UserProfileResponseDto userProfileResponseDto = await _customerService.GetUserProfile(new GetUserProfileRequestDto { UserName = request.Username });

            //Get Store Details
            var storeDto = await _storerepository.GetByIdAsync(request.StoreId);

            var orderDetails = _orderRepository.Table.Where(x => x.OrderNumber == request.OrderNumber).SingleOrDefault();

            try
            {

                //Send email to the customer
                if (!string.IsNullOrWhiteSpace(userProfileResponseDto.Email))
                {

                    var orderDto = _mapper.Map<List<OrderItem>, List<Model.NotificationFacade.Email.OrderItemDto>>(orderDetails.OrderItems);

                    orderDto.ForEach(
                        cc =>
                        {
                            var prod = _productRepository.Table.Where(x => x.Id == cc.ProductId).Select(x => new { x.Name, x.Price }).SingleOrDefault();
                            cc.ProductName = prod.Name;
                            cc.UnitPriceInclTax = prod.Price;
                            var product = _productRepository.Table.Where(a => a.Id.Equals(cc.ProductId)).FirstOrDefaultAsync().Result;
                            var ordersAttributes = ParseProductAttributesFromXml(cc.AttributesXml, product).Result;
                            cc.ProductAttributes.AddRange(ordersAttributes);


                        });


                    foreach (var order in orderDto)
                    {
                        foreach (var item in order.ProductAttributes)
                        {
                            foreach (var attr in item.ProductAttributeValues)
                            {
                                order.UnitPriceInclTax += attr.PriceAdjustment;
                            }

                        }
                    }

                    var param = new RazorEngineDto
                    {
                        CustomerName = userProfileResponseDto.DisplayName,
                        CustomerPhone = userProfileResponseDto.Username,
                        CustomerEmail = userProfileResponseDto.Email,
                        StoreName = storeDto.Name,
                        StoreEmail = storeDto.CompanyEmail,
                        StoreAddress = storeDto.CompanyAddress,
                        StoreContact = storeDto.CompanyPhoneNumber,
                        OrderDate = DateTime.Now,
                        OrderNumber = request.OrderNumber,
                        OrderItems = orderDto,
                        SubTotal = orderDetails.OrderSubtotalInclTax,
                        Discount = orderDetails.OrderDiscount,
                        Tax = orderDetails.OrderTax,
                        TotalPrice = orderDetails.OrderTotal,
                        TipAmount = orderDetails.TipAmount,
                        PaymentId = orderDetails.StripePaymentId,
                        PaymentMessage = (request.isPayAtStore) ? $"Payment Method: Pay at Store ${orderDetails.OrderTotal}" : $"Payment Method: Credit Card ${orderDetails.OrderTotal}",
                        ConfirmationMessage = (request.isPayAtStore) ? $"Thank you for your order, you have selected to Pay at Store, please pay the total amount at the store. Your order details are below." : $"Thank you for placing the order. Your order information is as follows.",
                        DisplayText = qrCode == null ? string.Empty : $"<h2>{qrCode.DisplayText}</h2>",
                        OrderComments = string.IsNullOrWhiteSpace(request.OrderComments) ? string.Empty : $"<tbody><tr><td align='right'><b>Additional Comments: </b></td><td>{request.OrderComments}</td></tr></tbody></br>"
                    };

                    string template = GetTemplate(param);

                    var reqCustomer = new EmailRequestDto
                    {
                        CustomerEmail = userProfileResponseDto.Email,//"skchauhan016@gmail.com", //storeDto.CompanyEmail,
                        StoreEmail = storeDto.CompanyEmail,
                        Subject = $"{storeDto.Name} : Thank you for placing the order. Order# {orderDetails.OrderNumber}",// $"Order #{orderDetails.OrderNumber} Confirmation",
                        Body = template,

                    };
                    await _emailService.SendEmail(reqCustomer);

                    response.IsEmailSend = true;// resStore.IsEmailSent;
                }

            }
            catch (Exception ex)
            {
                //TODO
            }
            return response;
        }

        private string GetTemplate(RazorEngineDto param)
        {


            string newTemplate = @"<!DOCTYPE html>
<html lang='en'>

<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Broker Signing Contract</title>
    <style type='text/css'>
        @@import url('https://fonts.googleapis.com/css?family=Lato|Montserrat|Open+Sans|Oswald|Raleway');

        html,
        body {
            margin: 0;
            padding: 0;
            height: 100% !important;
            width: 100% !important;
        }

        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        .ExternalClass {
            width: 100%;
        }

        table {
            border: 0;
            border-spacing: 0 !important;
            border-collapse: collapse;
            margin-left: auto;
            margin-right: auto;
        }

        td {
            padding: 0px;
        }

        .ExternalClass,
        .ExternalClass * {
            line-height: 100%;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        .yshortcuts a {
            border-bottom: none !important;
        }

        .mobile-link--footer a {
            color: #666 !important;
        }

        img {
            border: 0 !important;
            outline: none !important;
            text-decoration: none !important;
        }

        @@media screen and (max-device-width: 600px), screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }

            img[class='fluid'],
            img[class='fluid-centered'] {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: auto !important;
            }

            img[class='fluid-centered'] {
                margin: auto !important;
            }

            td[class='stack-column'],
            td[class='stack-column-center'] {
                display: block !important;
                width: 100% !important;
                direction: ltr !important;
            }

            td[class='stack-column-center'] {
                text-align: center !important;
            }

            td[class='data-table-th'] {
                display: none !important;
            }

            td[class='data-table-td'],
            td[class='data-table-td-title'] {
                display: block !important;
                width: 100% !important;
                border: 0 !important;
            }

            td[class='data-table-td-title'] {
                font-weight: bold;
                color: #333;
                padding: 10px 0 0 0 !important;
                border-top: 2px solid #eeeeee !important;
            }

            td[class='data-table-td'] {
                padding: 5px 0 0 0 !important
            }

            td[class='data-table-mobile-divider'] {
                display: block !important;
                height: 20px;
            }
        }
    </style>
</head>";
            newTemplate += $@"<body leftmargin='0' topmargin='0' marginwidth='0' marginheight='0' 
      style='margin:0;padding:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;background-color:#F8F8F8;'>
    <table height='100%' width='80%'>
        <tr>
            <td>
                <table style='width:700px;margin:auto;' bgcolor='#FFFFFF' class='email-container'>
                    <tr>
                        <td style='padding:35px 35px;width:100%'>
                            <table width='100%'>
                                <tr>
                                    <td style='padding-bottom:20px;'>
                                        <span style='display:block;font-family:Montserrat,sans-serif;font-size:22px;color:#030000;font-weight:600;text-transform:uppercase;'>
                                            {param.StoreName}
                                        </span>
                                        {param.StoreContact}
                                    </td>
                                </tr>

                            </table>
                            <hr />

                            <table width='100%' style='margin-top:10px;'>
                                <tr>
                                    <td style='width:100%;border:1px solid #b2b2b2;padding:20px 15px;'>
                                        <table width='100%'>
                                            <tr>
                                                <td colspan='2'
                                                    style='border-bottom:1px solid #b2b2b2;padding-bottom:5px;'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:16px;color:#030000;'>
                                                        Order Details
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-top:15px;width:40%'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:13px;color:#222222;'>Payment Reference</span>
                                                </td>
                                                <td style='padding-top:15px;'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:13px;color:#222222;'>{param.PaymentId}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-top:15px;width:40%'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:13px;color:#222222;'>Confirmation</span>
                                                </td>
                                                <td style='padding-top:15px;'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:13px;color:#222222;'>{param.OrderNumber}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-top:15px;width:40%'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:13px;color:#222222;'>Order</span>
                                                </td>
                                                <td style='padding-top:15px;'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:13px;color:#222222;'>{param.OrderNumber}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-top:15px;width:40%'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:13px;color:#222222;'>Received</span>
                                                </td>
                                                <td style='padding-top:15px;'>
                                                    <span style='display:block;font-family:' Open Sans',sans-serif;font-size:13px;color:#222222;'>{param.OrderDate.ToString("MMM dd yyyy h:mm tt")}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>

                                </tr>
                            </table>
                            <table width='100%'>
                                <tr>
                                    <td width='100%' height='25'></td>
                                </tr>
                            </table>
                            <table width='100%'>
                                <tr>
                                    <td style='border:1px solid #b2b2b2;'>
                                        <table width='100%'>

                                            <tr>
                                                <td>
                                                    <table width='100%'>
                                                        <tr>
                                                            <td style='padding: 20px 15px;'>
                                                                <table width='100%'>
                                                                    <tr style='border-bottom:1px solid #b2b2b2;'>
                                                                        <th align='left'
                                                                            style='font-family:Montserrat,sans-serif;font-size:13px;color:#030000;font-weight:600;'>
                                                                            Qty
                                                                        </th>
                                                                        <th align='left'
                                                                            style='font-family:Montserrat,sans-serif;font-size:13px;color:#030000;font-weight:600;'>
                                                                            Product Description
                                                                        </th>
                                                                        <th align='left'
                                                                            style='font-family:Montserrat,sans-serif;font-size:13px;color:#030000;font-weight:600;'>
                                                                            Price
                                                                        </th>

                                                                    </tr>";

            foreach (var item in param.OrderItems)
            {
                newTemplate += $@" <tr>
                                                                        <td style='padding:15px 0;'>
                                                                            <span style='font-family:Open Sans,sans-serif;font-size:13px;color:#222222;display:block;'>
                                                                                {item.Quantity}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <span style='font-family:Open Sans,sans-serif;font-size:13px;color:#222222;display:block;'>
                                                                                {item.ProductName}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <span style='font-family:Open Sans,sans-serif;font-size:13px;color:#222222;display:block;'>
                                                                                ${(item.UnitPriceInclTax) * (item.Quantity)}
                                                                            </span>
                                                                        </td>

                                                                    </tr>";
            }

            newTemplate += $@" <tr>
                                                                        <td style='border-top:1px solid'></td>
                                                                        <td style='border-top:1px solid'><b>Subtotal </b></td>
                                                                        <td style='border-top:1px solid'>
                                                                            <span style='font-family:Open Sans,sans-serif;font-size:13px;color:#222222;display:block;'>
                                                                                &nbsp;${String.Format("{0:0.00}", param.SubTotal)}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td></td>
                                                                        <td><b>Tax</b> </td>
                                                                        <td>
                                                                            <span style='font-family:Open Sans,sans-serif;font-size:13px;color:#222222;display:block;'>
                                                                                &nbsp;${String.Format("{0:0.00}", param.Tax)}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
 <tr>
                                                                        <td></td>
                                                                        <td><b>Discount</b> </td>
                                                                        <td>
                                                                            <span style='font-family:Open Sans,sans-serif;font-size:13px;color:#222222;display:block;'>
                                                                                - ${String.Format("{0:0.00}", param.Discount)}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style='border-top:1px solid'></td>
                                                                        <td style='border-top:1px solid'><b>Total</b></td>
                                                                        <td style='border-top:1px solid'>
                                                                            <span style='font-family:Open Sans,sans-serif;font-size:13px;color:#222222;display:block;'>
                                                                                &nbsp;${String.Format("{0:0.00}", param.TotalPrice)}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                  
                </table>
            </td>
        </tr>
    </table>
</body>

</html>";


            string newTemplateV1 = $@"<div>
    <div></div><div>
        <div>
            <div>
                <div>
                    <div>
                        <div dir='auto'>
                            <blockquote type='cite'>
                                <div dir='ltr'>
                                    <div>
                                        <div>
                                            <br>

                                            <br>

                                            Dear {param.CustomerName},</br>

                                            {param.ConfirmationMessage} 
                                            
                                            <center>
                                                {param.DisplayText}</br>
                                                <h2>ORDER DETAILS</h2>
                                            </center>
                                            <table width='100%' cellspacing='0' cellpadding='4' id='x_x_m_-4342459412333156220carttable'>
                                                <tbody>
                                                    <tr>
                                                        <td><b>Product</b></td>
                                                        <td align='right'><b>Unit Cost</b></td>
                                                        <td align='right'><b>Quantity</b></td>
                                                        <td align='right'><b>Sub Total</b></td>
                                                    </tr>";

            foreach (var item in param.OrderItems)
            {

                newTemplateV1 += $@"<tr><td>
                                                            <h3><b>{item.ProductName} </b></h3>
                                                            <ul></ul>
                                                        </td>
                                                        <td align='right'>${String.Format("{0:0.00}", item.UnitPriceInclTax)}</td>
                                                        <td align='right'>{item.Quantity}</td>
                                                        <td align='right'>${String.Format("{0:0.00}", (item.UnitPriceInclTax) * (item.Quantity))}</td>
                                                    </tr>";

                foreach (var attr in item.ProductAttributes)
                {
                    newTemplateV1 += $@"<tr><td><b>{attr.ProductAttributeName}</b> <ul></ul></td></tr>";
                    foreach (var values in attr.ProductAttributeValues)
                    {
                        //newTemplateV1 += $@"<tr>
                        //                                <td>{values.Name}</td>
                        //                                <td align='right'>${String.Format("{0:0.00}", values.PriceAdjustment)}</td>
                        //                                <td align='right'>1</td>
                        //                                <td align='right'>${String.Format("{0:0.00}", values.PriceAdjustment)}</td>
                        //                            </tr>";

                        newTemplateV1 += $@"<tr>
                                                        <td>{values.Name}</td>
                                                        <td align='right'>${String.Format("{0:0.00}", values.PriceAdjustment)}</td>
                                                        <td align='right'>-</td>
                                                        <td align='right'>-</td>
                                                    </tr>";
                    }

                }

            }


            newTemplateV1 += $@" 
                                                    <tr>
                                                        <td align='right' colspan='3'><b>Tax</b></td>
                                                        <td align='right'><b>${String.Format("{0:0.00}", param.Tax)}</b></td>
                                                    </tr>
                                                    <tr id='x_x_m_-4342459412333156220tipRow'>
                                                        <td align='right' colspan='3'><b>Tip</b></td>
                                                        <td align='right'><b>${String.Format("{0:0.00}", param.TipAmount)}</b></td>
                                                    </tr>
                                                    <tr id='x_x_m_-4342459412333156220tipRow'>
                                                        <td align='right' colspan='3'><b>Discount</b></td>
                                                        <td align='right'><b>-${String.Format("{0:0.00}", param.Discount)}</b></td>
                                                    </tr>
                                                    <tr>
                                                        <td align='right' colspan='3'><b>Total</b></td>
                                                        <td align='right'><b>${String.Format("{0:0.00}", param.TotalPrice)}</b></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <br>
                                            {param.OrderComments}
                                            <center>
                                                <h2>CONTACT DETAILS</h2>
                                            </center>
                                            <table align='center' cellspacing='2' cellpadding='4'>
                                                <tbody>
                                                    <tr>
                                                        <td align='right'><b>Name:</b></td>
                                                        <td>{param.CustomerName}</td>
                                                    </tr>
                                                   
                                                    <tr>
                                                        <td align='right'><b>Email Address:</b></td>
                                                        <td><a href='mailto:{param.CustomerEmail}' target='_blank' rel='noopener noreferrer' data-auth='NotApplicable'>{param.CustomerEmail}</a></td>
                                                    </tr>
                                                    <tr>
                                                        <td align='right'><b>Phone #:</b></td>
                                                        <td>{param.CustomerPhone}</td>
                                                    </tr>
                                                    
                                                </tbody>
                                            </table>
                                            <br>

                                            <center>
                                                <h2>STORE DETAILS</h2>
                                            </center>
                                            <table align='center' cellspacing='2' cellpadding='4'>
                                                <tbody>
                                                    <tr>
                                                        <td align='right'><b>Name:</b></td>
                                                        <td>{param.StoreName}</td>
                                                    </tr>
                                                   
                                                    <tr>
                                                        <td align='right'><b>Email Address:</b></td>
                                                        <td><a href='mailto:{param.StoreEmail}' target='_blank' rel='noopener noreferrer' data-auth='NotApplicable'>{param.StoreEmail}</a></td>
                                                    </tr>
                                                     <tr>
                                                        <td align='right'><b>Address:</b></td>
                                                        <td>{param.StoreAddress}</td>
                                                    </tr>
                                                    <tr>
                                                        <td align='right'><b>Phone #:</b></td>
                                                        <td>{param.StoreContact}</td>
                                                    </tr>
                                                    
                                                </tbody>
                                            </table>
                                            <br>

                                            <center>
                                                <h2>PAYMENT DETAILS</h2>
                                            </center>
                                            <table align='center' cellspacing='2' cellpadding='4'>
                                                <tbody>
                                                    <tr>
                                                        <td align='right'><b>Reference Id:</b></td>
                                                        <td>{param.PaymentId}</td>
                                                    </tr>
                                                    
                                                </tbody>
                                            </table>
                                            <br>
                                            <center><b>{param.PaymentMessage}</b></center>
                                                   </br>
                                            <center><b>Note: Payment Transaction will show up as '<a href='#' target='_blank' rel='noopener noreferrer' data-auth='NotApplicable'>SS*{param.StoreName}</a>' on your credit card statement.</b></center>

                                        </div>
                                    </div>
                                </div>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

</div>";

            return newTemplateV1;
        }

        private string SendEmail(UserProfileResponseDto userProfileResponseDto, string template, RazorEngineDto param)
        {
            var reqCustomer = new EmailRequestDto
            {
                // Email = userProfileResponseDto.Email,//"skchauhan016@gmail.com", //storeDto.CompanyEmail,
                CustomerEmail = "skchauhan016@gmail.com", //storeDto.CompanyEmail,
                Subject = "Order Recevied",
                Body = Utils.CreateTemplate<RazorEngineDto>(template, param) //Engine.Razor.RunCompile(template, "templateKey", typeof(RazorEngineDto), param)// Utils.CreateTemplate<RazorEngineDto>(template, param)
            };
            _emailService.SendEmail(reqCustomer);
            try
            {
                _emailService.SendEmail(reqCustomer);
            }
            catch (Exception ex)
            {

                return ex.ToString();
            }
            return "";

        }

        public string FixBase64ForImage(string image)
        {
            System.Text.StringBuilder sbText = new System.Text.StringBuilder(image, image.Length);
            sbText.Replace("\r\n", string.Empty); sbText.Replace(" ", string.Empty);
            return sbText.ToString();
        }

        public async Task<string> VerifyEmail(string token)
        {

            string response = @"<style>
            .container {
                height: 100%;        
            }

            .vertical-center {
                margin: 0;
                position: absolute;
                padding-left: 30%;
                top: 50%;
                -ms-transform: translateY(-50%);
                transform: translateY(-50%);
            }

        </style>

        <div class='container'>
            <div class='vertical-center'>
                <h2>Token is invalid.</h2>
            </div>
        </div>"; ;
            if (string.IsNullOrEmpty(token))
                return response;

            var notification = _notificationRepository.Table.Where(x => x.Token.Equals(token)).SingleOrDefault();
            if (!(notification is null) && notification.ValidFrom <= DateTime.Now && notification.ValidTo >= DateTime.Now)
            {
                notification.IsVerified = true;
                await _notificationRepository.UpdateAsync(notification);
                response = @"<style>
            .container {
                height: 100%;        
            }

            .vertical-center {
                margin: 0;
                position: absolute;
                padding-left: 30%;
                top: 50%;
                -ms-transform: translateY(-50%);
                transform: translateY(-50%);
            }

        </style>

        <div class='container'>
            <div class='vertical-center'>
                <h2>Your email has been verified successfully.</h2>
            </div>
        </div>"; ;
            }
            return response;
        }

        //        public async Task<bool> SendVerificationEmail(string userName)
        //        {
        //            //Get Customer Details
        //            UserProfileResponseDto userProfileResponseDto = await _customerService.GetUserProfile(new GetUserProfileRequestDto { UserName = userName });

        //            if (userProfileResponseDto is null)
        //                return false;

        //            var request = new UserEmailVerification
        //            {
        //                CustomerId = userProfileResponseDto.CustomerId,
        //                Email = userProfileResponseDto.Email,
        //                Token = System.Guid.NewGuid().ToString(),
        //                ValidFrom = DateTime.Now,
        //                ValidTo = DateTime.Now.AddMinutes(30),
        //                IsVerified = false
        //            };
        //            await _notificationRepository.InsertAsync(request);

        //            string body = @"<head>
        //    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
        //    <title>Welcome to Swift Serve, Confirm your email</title>
        //    <style type='text/css'>


        //        #outlook a {
        //            padding: 0;
        //            text-decoration: none !important;
        //        }


        //        .ReadMsgBody {
        //            width: 100%;
        //        }

        //        .ExternalClass {
        //            width: 100%;
        //        }


        //        .ExternalClass,
        //        .ExternalClass p,
        //        .ExternalClass span,
        //        .ExternalClass font,
        //        .ExternalClass td,
        //        .ExternalClass div {
        //            line-height: 100%;
        //        }


        //        body,
        //        table,
        //        td,
        //        p,
        //        a,
        //        li,
        //        blockquote {
        //            -webkit-text-size-adjust: 100%;
        //            -ms-text-size-adjust: 100%;
        //        }


        //        table,
        //        td {
        //            mso-table-lspace: 0pt;
        //            mso-table-rspace: 0pt;
        //        }


        //        img {
        //            -ms-interpolation-mode: bicubic;
        //        }


        //        body {
        //            margin: 0;
        //            padding: 0;
        //        }

        //        img {
        //            border: 0;
        //            height: auto;
        //            line-height: 100%;
        //            outline: none;
        //            text-decoration: none;
        //        }

        //        table {
        //            border-collapse: collapse !important;
        //        }

        //        body,
        //        #bodyTable,
        //        #bodyCell {
        //            height: 100% !important;
        //            margin: 0;
        //            padding: 0;
        //            width: 100% !important;
        //        }


        //        #bodyCell {
        //            padding: 20px;
        //        }

        //        #templateContainer {
        //            width: 600px;
        //        }

        //        body,
        //        #bodyTable {
        //            background-color: #F8F8F8;
        //        }
        //        #bodyCell {
        //            border-top: 2px solid #BBBBBB;
        //        }
        //        #templateContainer {
        //            border: 1px solid #BBBBBB;
        //        }
        //        h1 {
        //            color: #202020 !important;
        //            display: block;
        //            font-family: Helvetica;
        //            font-size: 26px;
        //            font-style: normal;
        //            font-weight: bold;
        //            line-height: 100%;
        //            letter-spacing: normal;
        //            margin-top: 0;
        //            margin-right: 0;
        //            margin-bottom: 10px;
        //            margin-left: 0;
        //            text-align: left;
        //        }
        //        h2 {
        //            display: block;
        //            font-style: normal;
        //            font-weight: bold;
        //            line-height: 150%;
        //            letter-spacing: normal;
        //            margin-top: 0;
        //            margin-right: 0;
        //            margin-bottom: 10px;
        //            margin-left: 0;
        //            text-align: left;
        //            font-family:'Open Sans', sans-serif;
        //            font-size:18px;
        //            color:#4e4e4e !important;
        //        }
        //        h3 {
        //            color: #606060 !important;
        //            display: block;
        //            font-family: Helvetica;
        //            font-size: 16px;
        //            font-style: italic;
        //            font-weight: normal;
        //            line-height: 100%;
        //            letter-spacing: normal;
        //            margin-top: 0;
        //            margin-right: 0;
        //            margin-bottom: 10px;
        //            margin-left: 0;
        //            text-align: left;
        //        }
        //        h4 {
        //            color: #808080 !important;
        //            display: block;
        //            font-family: Helvetica;
        //            font-size: 14px;
        //            font-style: italic;
        //            font-weight: normal;
        //            line-height: 100%;
        //            letter-spacing: normal;
        //            margin-top: 0;
        //            margin-right: 0;
        //            margin-bottom: 10px;
        //            margin-left: 0;
        //            text-align: left;
        //        }

        //        #templateHeader {
        //            background-color: #F8F8F8;
        //            border-top: 1px solid #FFFFFF;
        //            border-bottom: 1px solid #CCCCCC;
        //        }
        //        .headerContent {
        //            font-family:'Lato', sans-serif;
        //            line-height: 100%;
        //            padding-top: 15px;
        //            padding-right: 0;
        //            padding-bottom: 15px;
        //            padding-left: 20px;
        //            text-align: left;
        //            vertical-align: middle;
        //            font-size:26px;
        //            font-weight:bold;
        //            color:#111111;
        //        }

        //        .headerContent a:link,
        //        .headerContent a:visited,

        //        .headerContent a .yshortcuts {
        //            color: #EB4102;
        //            font-weight: normal;
        //            text-decoration: underline;
        //        }

        //        #headerImage {
        //            height: auto;
        //            max-width: 600px;
        //        }


        //        #templateBody {
        //            background-color: #FFFFFF;
        //            border-top: 1px solid #FFFFFF;
        //            border-bottom: 1px solid #CCCCCC;
        //        }
        //        .bodyContent {
        //            font-family: 'Lato', sans-serif;
        //            font-size: 14px;
        //            line-height: 135%;
        //            color:rgb(142, 142, 147) !important;
        //            padding-top: 20px;
        //            padding-right: 20px;
        //            padding-bottom: 20px;
        //            padding-left: 20px;
        //            text-align: left;
        //        }
        //        .bodyContent a:link,
        //        .bodyContent a:visited,

        //        .bodyContent a .yshortcuts {
        //            color: #EB4102;
        //            font-weight: normal;
        //            text-decoration: underline;
        //        }

        //        .bodyContent img {
        //            display: inline;
        //            height: auto;
        //            max-width: 560px;
        //        }


        //        #templateFooter {
        //            background-color: #FFFFFF;
        //        }
        //        .footerContent {
        //            color: #808080;
        //            font-family: Helvetica;
        //            font-size: 10px;
        //            line-height: 100%;
        //            padding-top: 20px;
        //            padding-right: 20px;
        //            padding-bottom: 20px;
        //            padding-left: 20px;
        //            text-align: left;
        //        }
        //        .footerContent a:link,
        //        .footerContent a:visited,

        //        .footerContent a .yshortcuts,
        //        .footerContent a span {
        //            color: #606060;
        //            font-weight: normal;
        //            text-decoration: underline;
        //        }
        //        #address {
        //            background-color: #F8F8F8;
        //            border-top: 1px solid #CCCCCC;
        //        }



        //        @@media only screen and (max-width: 480px) {
        //            body,
        //            table,
        //            td,
        //            p,
        //            a,
        //            li,
        //            blockquote {
        //                -webkit-text-size-adjust: none !important;
        //            }


        //            body {
        //                width: 100% !important;
        //                min-width: 100% !important;
        //            }


        //            #bodyCell {
        //                padding: 10px !important;
        //            }


        //            #templateContainer {
        //                max-width: 600px !important;
        //                width: 100% !important;
        //            }
        //            h1 {
        //                font-size: 24px !important;
        //                line-height: 100% !important;
        //            }
        //            h2 {
        //                font-size: 20px !important;
        //                line-height: 100% !important;
        //            }
        //            h3 {
        //                font-size: 18px !important;
        //                line-height: 100% !important;
        //            }
        //            h4 {
        //                font-size: 16px !important;
        //                line-height: 100% !important;
        //            }


        //            #headerImage {
        //                height: auto !important;
        //                max-width: 600px !important;
        //                width: 100% !important;
        //            }
        //            .headerContent {
        //                font-size: 20px !important;
        //                line-height: 125% !important;
        //            }

        //            .bodyContent {
        //                font-size: 18px !important;
        //                line-height: 125% !important;
        //            }


        //            .footerContent {
        //                font-size: 14px !important;
        //                line-height: 115% !important;
        //            }

        //            .footerContent a {
        //                display: block !important;
        //            }
        //        }
        //    </style>
        //</head>

        //<body leftmargin='0' marginwidth='0' topmargin='0' marginheight='0' offset='0'>
        //    <center>
        //        <table align='center' border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
        //            <tr>
        //                <td align='center' valign='top' id='bodyCell'>
        //                    <!-- BEGIN TEMPLATE // -->
        //                    <table border='0' cellpadding='0' cellspacing='0' id='templateContainer'>
        //                        <tr>
        //                            <td align='center' valign='top'>
        //                                <table border='0' cellpadding='0' cellspacing='0' width='100%' id='templateHeader'>
        //                                    <tr>
        //                                        <td valign='top' class='headerContent'>

        //                                        </td>
        //                                    </tr>
        //                                </table>
        //                            </td>
        //                        </tr>
        //                        <tr>
        //                            <td align='center' valign='top'>
        //                                <!-- BEGIN BODY // -->
        //                                <table border='0' cellpadding='0' cellspacing='0' width='100%' id='templateBody'>
        //                                    <tr>
        //                                        <td valign='top' class='bodyContent' mc:edit='body_content'>
        //                                            <h2>Welcome to Swift Serve</h2>
        //                                            To verify your, you need to confirm your email by clicking below.
        //                                        </td>
        //                                    </tr>
        //                                    <tr>
        //                                        <td align='center' valign='top'>
        //                                            <!-- CENTERING TABLE // -->
        //                                            <table border='0' cellpadding='0' cellspacing='0' width='100%'>
        //                                                <tr style='padding-top:0;'>
        //                                                    <td align='center' valign='top'>
        //                                                        <table border='0' cellpadding='30' cellspacing='0' width='500'>
        //                                                            <tr>
        //                                                                <td style='padding-top:0;' align='center' valign='top' width='500'>
        //                                                                    <table border='0' cellpadding='0' cellspacing='0' width='70%' style='background-color:#FFFFFF;border-collapse:separate;border:1px solid #4e4e4e;'>
        //                                                                        <tr>
        //                                                                            <td align='center' valign='middle' style='padding-top:15px;padding-bottom:15px;padding-right:15px;padding-left:15px;'>
        //                                                                                <a style='color:#4e4e4e;font-family:Open Sans, sans-serif;text-decoration:none;font-size:16px;line-height:100%;display:inline-block;font-weight:bold;' href='@Model.ActivationUrl'>
        //                                                                                    <span style='text-decoration:none !important; text-decoration:none;'>Confirm Email Address</span>
        //                                                                                </a>
        //                                                                            </td>
        //                                                                        </tr>
        //                                                                    </table>
        //                                                                </td>
        //                                                            </tr>
        //                                                        </table>
        //                                                    </td>
        //                                                </tr>
        //                                            </table>
        //                                            <!-- // CENTERING TABLE -->
        //                                        </td>
        //                                    </tr>
        //                                    <tr>
        //                                        <td valign='top' class='bodyContent' mc:edit='body_content'>
        //                                            <p>Thanks</p>
        //                                            The SwiftServe Team
        //                                        </td>
        //                                    </tr>
        //                                </table>
        //                                <!-- // END BODY -->
        //                            </td>
        //                        </tr>

        //                        <tr>
        //                            <td align='center' valign='top'>
        //                                <table border='0' cellpadding='0' cellspacing='0' width='100%' id='address'>

        //									<tr>
        //                                        <td style='padding-top:10px;padding-bottom:20px;'>
        //                                            <table border='0' cellpadding='0' cellspacing='0' width='100%'>
        //                                                <tr>
        //                                                    <td align='center' valign='top'
        //                                                        style='font-family:Lato, sans-serif;font-size:13px;line-height:135%;color:#666666;'>
        //                                                       If you received this email in error please forward this message to support@swiftserve.com 
        //                                                    </td>
        //                                                </tr>
        //                                            </table>
        //                                        </td>
        //                                    </tr>
        //                                </table>
        //                            </td>
        //                        </tr>
        //                    </table>
        //                    <!-- // END TEMPLATE -->
        //                </td>
        //            </tr>
        //        </table>
        //    </center>
        //</body>";
        //            string url = _appSettings.VerifyEmailUrl + request.Token;
        //            body = body.Replace("@Model.ActivationUrl", url);

        //            var emailRequest = new EmailRequestDto
        //            {
        //                Body = body,
        //                CustomerEmail = userProfileResponseDto.Email,
        //                Subject = "Swift Serve Email Verification",

        //            };
        //            await _emailService.SendEmail(emailRequest);

        //            return true;
        //        }
    }
}
