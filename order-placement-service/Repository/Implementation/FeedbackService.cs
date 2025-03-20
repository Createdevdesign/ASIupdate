using AutoMapper;

using System;

using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Options;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Entities.Customers;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Entities.Feedback;
using order_placement_service.Model.CustomerFacade.Customer;
using order_placement_service.Model.NotificationFacade.Email;

namespace order_placement_service.Repository.Implementation
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IRepository<Feedback> _feedbackRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly AppSettings _appSettings;

        public FeedbackService(IRepository<Feedback> feedbackRepository, IMapper mapper, IEmailService emailService, IRepository<Customer> customerRepository, IOptions<AppSettings> appSettings)
        {
            _feedbackRepository = feedbackRepository;
            _mapper = mapper;
            _emailService = emailService;
            _customerRepository = customerRepository;
            _appSettings = appSettings.Value;
        }

        public async Task<SavefeedbackResponseDto> SaveFeedback(SaveFeedbackRequestDto requestDto)
        {
            if (string.IsNullOrWhiteSpace(requestDto.Username))
                return await Task.FromResult<SavefeedbackResponseDto>(null);

            Feedback feedback = new Feedback
            {
                Username = requestDto.Username,
                Text = requestDto.Feedback,
                CreateDate = DateTime.UtcNow
            };

            feedback = await _feedbackRepository.InsertAsync(feedback);
            var customer = _customerRepository.Table.Where(x => x.Username.Equals(requestDto.Username)).FirstOrDefault();

            string body = @"<head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
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
                                            <h2>Feedback from {DisplayName}:</h2>
                                            {feedback}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align='center' valign='top'>
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
                                                       If you received this email in error please forward this message to support@swiftserve.com 
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
            body = body.Replace("{DisplayName}", customer.DisplayName).Replace("{feedback}", requestDto.Feedback);
            var response = await _emailService.SendEmail(new EmailRequestDto { Body = body, CustomerEmail = _appSettings.FeedbackEmail, Subject = "SwiftServe Feedback" });

            return _mapper.Map<Feedback, SavefeedbackResponseDto>(feedback);
        }
    }
}
