using Microsoft.Extensions.Options;

using System;

using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System.Linq;
using System.Threading.Tasks;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Entities.Customers;
using order_placement_service.Entities.Notification;
using order_placement_service.Model.CustomerFacade.Customer;
using order_placement_service.Model.NotificationFacade.Email;

namespace order_placement_service.Repository.Implementation
{
    public class NotificationsService : INotificationsService
    {
        private readonly AppSettings _appSettings;
        private readonly IEmailService _emailService;
        private readonly IRepository<UserEmailVerification> _notificationRepository;
        private readonly IRepository<Customer> _customerRepository;

        public NotificationsService(
            IOptions<AppSettings> appSettings,
            ICustomersService customerService,
            IRepository<UserEmailVerification> notificationRepository,
            IRepository<Customer> customerRepository,
            IEmailService emailService
            )
        {
            _appSettings = appSettings.Value;
            _notificationRepository = notificationRepository;
            _customerRepository = customerRepository;
            _emailService = emailService;

        }
        public async Task<bool> SendVerificationEmail(UserProfileResponseDto userProfileResponseDto)
        {


            var request = new UserEmailVerification
            {
                CustomerId = userProfileResponseDto.CustomerId,
                Email = userProfileResponseDto.Email,
                Token = System.Guid.NewGuid().ToString(),
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddHours(24),
                IsVerified = false

            };

            var customer = await _customerRepository.Table.Where(x => x.Username.Equals(userProfileResponseDto.Username)).SingleOrDefaultAsync();
            var notification = _notificationRepository.Table.Where(x => x.Email.Equals(request.Email) && x.CustomerId.Equals(customer.Id)).SingleOrDefault();

            //Check if verification email is already is sent
            if (!(notification is null) && notification.IsVerified)
            {
                return true;
            }
            else if (notification is null)
            {
                await _notificationRepository.InsertAsync(request);
            }
            else
            {
                request.Id = notification.Id;
                await _notificationRepository.UpdateAsync(request);
            }



            string body = @"<head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
    <title>Welcome to Swift Serve, Confirm your email</title>
    <style type='text/css'>
       
        
        #outlook a {
            padding: 0;
            text-decoration: none !important;
        }

       
        .ReadMsgBody {
            width: 100%;
        }

        .ExternalClass {
            width: 100%;
        }

        
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: 100%;
        }

       
        body,
        table,
        td,
        p,
        a,
        li,
        blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        
        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

      
        img {
            -ms-interpolation-mode: bicubic;
        }

       
        body {
            margin: 0;
            padding: 0;
        }

        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body,
        #bodyTable,
        #bodyCell {
            height: 100% !important;
            margin: 0;
            padding: 0;
            width: 100% !important;
        }


        #bodyCell {
            padding: 20px;
        }

        #templateContainer {
            width: 600px;
        }

        body,
        #bodyTable {
            background-color: #F8F8F8;
        }
        #bodyCell {
            border-top: 2px solid #BBBBBB;
        }
        #templateContainer {
            border: 1px solid #BBBBBB;
        }
        h1 {
            color: #202020 !important;
            display: block;
            font-family: Helvetica;
            font-size: 26px;
            font-style: normal;
            font-weight: bold;
            line-height: 100%;
            letter-spacing: normal;
            margin-top: 0;
            margin-right: 0;
            margin-bottom: 10px;
            margin-left: 0;
            text-align: left;
        }
        h2 {
            display: block;
            font-style: normal;
            font-weight: bold;
            line-height: 150%;
            letter-spacing: normal;
            margin-top: 0;
            margin-right: 0;
            margin-bottom: 10px;
            margin-left: 0;
            text-align: left;
            font-family:'Open Sans', sans-serif;
            font-size:18px;
            color:#4e4e4e !important;
        }
        h3 {
            color: #606060 !important;
            display: block;
            font-family: Helvetica;
            font-size: 16px;
            font-style: italic;
            font-weight: normal;
            line-height: 100%;
            letter-spacing: normal;
            margin-top: 0;
            margin-right: 0;
            margin-bottom: 10px;
            margin-left: 0;
            text-align: left;
        }
        h4 {
            color: #808080 !important;
            display: block;
            font-family: Helvetica;
            font-size: 14px;
            font-style: italic;
            font-weight: normal;
            line-height: 100%;
            letter-spacing: normal;
            margin-top: 0;
            margin-right: 0;
            margin-bottom: 10px;
            margin-left: 0;
            text-align: left;
        }
       
        #templateHeader {
            background-color: #F8F8F8;
            border-top: 1px solid #FFFFFF;
            border-bottom: 1px solid #CCCCCC;
        }
        .headerContent {
            font-family:'Lato', sans-serif;
            line-height: 100%;
            padding-top: 15px;
            padding-right: 0;
            padding-bottom: 15px;
            padding-left: 20px;
            text-align: left;
            vertical-align: middle;
            font-size:26px;
            font-weight:bold;
            color:#111111;
        }

        .headerContent a:link,
        .headerContent a:visited,
        
        .headerContent a .yshortcuts {
            color: #EB4102;
            font-weight: normal;
            text-decoration: underline;
        }

        #headerImage {
            height: auto;
            max-width: 600px;
        }

       
        #templateBody {
            background-color: #FFFFFF;
            border-top: 1px solid #FFFFFF;
            border-bottom: 1px solid #CCCCCC;
        }
        .bodyContent {
            font-family: 'Lato', sans-serif;
            font-size: 14px;
            line-height: 135%;
            color:rgb(142, 142, 147) !important;
            padding-top: 20px;
            padding-right: 20px;
            padding-bottom: 20px;
            padding-left: 20px;
            text-align: left;
        }
        .bodyContent a:link,
        .bodyContent a:visited,
       
        .bodyContent a .yshortcuts {
            color: #EB4102;
            font-weight: normal;
            text-decoration: underline;
        }

        .bodyContent img {
            display: inline;
            height: auto;
            max-width: 560px;
        }

        
        #templateFooter {
            background-color: #FFFFFF;
        }
        .footerContent {
            color: #808080;
            font-family: Helvetica;
            font-size: 10px;
            line-height: 100%;
            padding-top: 20px;
            padding-right: 20px;
            padding-bottom: 20px;
            padding-left: 20px;
            text-align: left;
        }
        .footerContent a:link,
        .footerContent a:visited,
       
        .footerContent a .yshortcuts,
        .footerContent a span {
            color: #606060;
            font-weight: normal;
            text-decoration: underline;
        }
        #address {
            background-color: #F8F8F8;
            border-top: 1px solid #CCCCCC;
        }

       

        @@media only screen and (max-width: 480px) {
            body,
            table,
            td,
            p,
            a,
            li,
            blockquote {
                -webkit-text-size-adjust: none !important;
            }

           
            body {
                width: 100% !important;
                min-width: 100% !important;
            }

          
            #bodyCell {
                padding: 10px !important;
            }

          
            #templateContainer {
                max-width: 600px !important;
                width: 100% !important;
            }
            h1 {
                font-size: 24px !important;
                line-height: 100% !important;
            }
            h2 {
                font-size: 20px !important;
                line-height: 100% !important;
            }
            h3 {
                font-size: 18px !important;
                line-height: 100% !important;
            }
            h4 {
                font-size: 16px !important;
                line-height: 100% !important;
            }

           
            #headerImage {
                height: auto !important;
                max-width: 600px !important;
                width: 100% !important;
            }
            .headerContent {
                font-size: 20px !important;
                line-height: 125% !important;
            }

            .bodyContent {
                font-size: 18px !important;
                line-height: 125% !important;
            }

          
            .footerContent {
                font-size: 14px !important;
                line-height: 115% !important;
            }

            .footerContent a {
                display: block !important;
            }
        }
    </style>
</head>

<body leftmargin='0' marginwidth='0' topmargin='0' marginheight='0' offset='0'>
    <center>
        <table align='center' border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
            <tr>
                <td align='center' valign='top' id='bodyCell'>
                    <!-- BEGIN TEMPLATE // -->
                    <table border='0' cellpadding='0' cellspacing='0' id='templateContainer'>
                        <tr>
                            <td align='center' valign='top'>
                                <table border='0' cellpadding='0' cellspacing='0' width='100%' id='templateHeader'>
                                    <tr>
                                        <td valign='top' class='headerContent'>
                                           
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align='center' valign='top'>
                                <!-- BEGIN BODY // -->
                                <table border='0' cellpadding='0' cellspacing='0' width='100%' id='templateBody'>
                                    <tr>
                                        <td valign='top' class='bodyContent' mc:edit='body_content'>
                                            <h2>Welcome to Swift Serve</h2>
                                            To verify your email, you need to confirm your email by clicking below.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align='center' valign='top'>
                                            <!-- CENTERING TABLE // -->
                                            <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                                                <tr style='padding-top:0;'>
                                                    <td align='center' valign='top'>
                                                        <table border='0' cellpadding='30' cellspacing='0' width='500'>
                                                            <tr>
                                                                <td style='padding-top:0;' align='center' valign='top' width='500'>
                                                                    <table border='0' cellpadding='0' cellspacing='0' width='70%' style='background-color:#FFFFFF;border-collapse:separate;border:1px solid #4e4e4e;'>
                                                                        <tr>
                                                                            <td align='center' valign='middle' style='padding-top:15px;padding-bottom:15px;padding-right:15px;padding-left:15px;'>
                                                                                <a style='color:#4e4e4e;font-family:Open Sans, sans-serif;text-decoration:none;font-size:16px;line-height:100%;display:inline-block;font-weight:bold;' href='@Model.ActivationUrl'>
                                                                                    <span style='text-decoration:none !important; text-decoration:none;'>Confirm Email Address</span>
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!-- // CENTERING TABLE -->
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='top' class='bodyContent' mc:edit='body_content'>
                                            <p>Thanks</p>
                                            The SwiftServe Team
                                        </td>
                                    </tr>
                                </table>
                                <!-- // END BODY -->
                            </td>
                        </tr>
                       
                        <tr>
                            <td align='center' valign='top'>
                                <table border='0' cellpadding='0' cellspacing='0' width='100%' id='address'>
							
									<tr>
                                        <td style='padding-top:10px;padding-bottom:20px;'>
                                            <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                                                <tr>
                                                    <td align='center' valign='top'
                                                        style='font-family:Lato, sans-serif;font-size:13px;line-height:135%;color:#666666;'>
                                                       If you received this email in error please forward this message to support@swiftserve.us 
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <!-- // END TEMPLATE -->
                </td>
            </tr>
        </table>
    </center>
</body>";
            string url = _appSettings.VerifyEmailUrl + request.Token;
            body = body.Replace("@Model.ActivationUrl", url);

            var emailRequest = new EmailRequestDto
            {
                Body = body,
                CustomerEmail = userProfileResponseDto.Email,
                Subject = "Swift Serve Email Verification",

            };
            await _emailService.SendEmail(emailRequest);

            return true;
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


    }
}
