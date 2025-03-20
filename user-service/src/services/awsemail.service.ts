
import { AwsSendEmail } from "../interfaces";
import debug from 'debug';
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,region: 'us-east-1'});

const log: debug.IDebugger = debug('app:aws-service');

class AwsEmailService implements AwsSendEmail {

  public async sendEmailNotification(templateData:any,customerEmail:string, token:string){
          
    var orderData:any =[]
      // productData.filter((item:any) => orderData.push(
      //    '																	<tr>'+
      // '																		<td>'+
      // '																			<h3><b>'+ item.Name+' </b></h3>'+
      // '																			<ul></ul>'+
      // '																		</td>'+
      // '																		<td align="right">'+"templateData.PrimaryCurrencyCode" + ' ' + item.Price+'</td>'+
      // '																		<td align="right">'+ item.Quantity+'</td>'+
      // '																		<td align="right">'+"templateData.PrimaryCurrencyCode" + ' ' + item.OrderSubTotal+'</td>'+
      // '																	</tr>'
      // ))
      var headers =  ', you have selected to '
      var params = {
        Destination: { /* required */
          // CcAddresses: [
          //   'EMAIL_ADDRESS'
            /* more items */
          // ],
          ToAddresses: [
            customerEmail
            // 'arun.dasari@aggielandsoftware.com',
            /* more items */
          ]
        },
        Message: { /* required */
          Body: { /* required */
            Html: {
             Charset: "UTF-8",
          //    Data: "<html><head></head><body class='clean-body' style='margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #fefefe; font-family:'Segoe UI Web (West European),Segoe UI,-apple-system,BlinkMacSystemFont,Roboto,Helvetica Neue,sans-serif;'><div><div class='rps_46ff'><div><div><div></div><div><div><div><div><div><div dir='auto'><blockquote type='cite'><div dir='ltr'><div><div><br><br>Dear Dasari Arun,<br>Thank you for your order, you have selected to Pay at Store, please pay the total amount at the store. Your order details are below. <center><br><h2>ORDER DETAILS</h2></center><table width='100%' cellspacing='0' cellpadding='4' id='x_x_x_m_-4342459412333156220carttable'><tbody><tr><td><b>Product</b></td><td align='right'><b>Unit Cost</b></td><td align='right'><b>Quantity</b></td><td align='right'><b>Sub Total</b></td></tr><tr><td><h3><b>Nike Tailwind Loose Short-Sleeve Running Shirt </b></h3><ul></ul></td><td align='right'>$6.99</td><td align='right'>1</td><td align='right'>$6.99</td></tr><tr><td align='right' colspan='3'><b>Tax</b></td><td align='right'><b>$1.50</b></td></tr><tr id='x_x_x_m_-4342459412333156220tipRow'><td align='right' colspan='3'><b>Tip</b></td><td align='right'><b>$0.00</b></td></tr><tr id='x_x_x_m_-4342459412333156220tipRow'><td align='right' colspan='3'><b>Discount</b></td><td align='right'><b>-$0.00</b></td></tr><tr><td align='right' colspan='3'><b>Total</b></td><td align='right'><b>$8.49</b></td></tr></table><br><center><h2>CONTACT DETAILS</h2></center><table align='center' cellspacing='2' cellpadding='4'><tbody><tr><td align='right'><b>Name:</b></td><td>Dasari Arun</td></tr><tr><td align='right'><b>Email Address:</b></td><td><a href='mailto:arun.dasari@aggielandsoftware.com' target='_blank' rel='noopener noreferrer' data-auth='NotApplicable' data-linkindex='0'>arun.dasari@aggielandsoftware.com</a> </td> </tr><tr><td align='right'><b>Phone #:</b></td><td>+919985143623</td></tr></tbody></table><br><center><h2>STORE DETAILS</h2></center><table align='center' cellspacing='2' cellpadding='4'><tbody><tr><td align='right'><b>Name:</b></td><td>SwiftServe Restaurant</td></tr><tr><td align='right'><b>Email Address:</b></td><td><a href='mailto:olibizdev@gmail.com' target='_blank' rel='noopener noreferrer' data-auth='NotApplicable' data-linkindex='1'>olibizdev@gmail.com</a></td></tr><tr><td align='right'><b>Address:</b></td><td>10111 St Charles Rock Rd, St Ann, MO 63074, United States</td></tr><tr><td align='right'><b>Phone #:</b></td><td>+1 314-429-6881</td></tr></tbody></table><br><center><h2>PAYMENT DETAILS</h2></center><table align='center' cellspacing='2' cellpadding='4'><tbody><tr><td align='right'><b>Reference Id:</b></td><td></td></tr></tbody></table><br><center><b>Payment Method: Pay at Store $8.49</b></center><br><center><b>Note: Payment Transaction will show up as 'SS*SwiftServe Restaurant' on your credit card statement.</b></center></div></div></div></blockquote></div></div></div></div></div></div></div></div></div></div></body></html>"
          Data:  "<head>" +
          "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />" +
          "<title>Welcome to Swift Serve, Confirm your email</title>" +
          "<style type='text/css'>" + 
      "#outlook a {padding: 0;text-decoration: none !important;}.ReadMsgBody {width: 100%;}.ExternalClass {width: 100%;}.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}body, table, td, p, a, li, blockquote {-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}img {-ms-interpolation-mode: bicubic;}body {margin: 0;padding: 0;}img {border: 0;height: auto;line-height: 100%;outline: none;text-decoration: none;}table {border-collapse: collapse !important;}body, #bodyTable, #bodyCell {height: 100% !important;margin: 0;padding: 0;width: 100% !important;}#bodyCell {padding: 20px;}#templateContainer {width: 600px;}body, #bodyTable {background-color: #F8F8F8;}#bodyCell {border-top: 2px solid #BBBBBB;}#templateContainer {border: 1px solid #BBBBBB;}h1 {color: #202020 !important;display: block;font-family: Helvetica;font-size: 26px;font-style: normal;font-weight: bold;line-height: 100%;letter-spacing: normal;margin-top: 0;margin-right: 0;margin-bottom: 10px;margin-left: 0;text-align: left;}h2 {display: block;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;margin-top: 0;margin-right: 0;margin-bottom: 10px;margin-left: 0;text-align: left;font-family:'Open Sans', sans-serif;font-size:18px;color:#4e4e4e !important;}h3 {color: #606060 !important;display: block;font-family: Helvetica;font-size: 16px;font-style: italic;font-weight: normal;line-height: 100%;letter-spacing: normal;margin-top: 0;margin-right: 0;margin-bottom: 10px;margin-left: 0;text-align: left;}h4 {color: #808080 !important;display: block;font-family: Helvetica;font-size: 14px;font-style: italic;font-weight: normal;line-height: 100%;letter-spacing: normal;margin-top: 0;margin-right: 0;margin-bottom: 10px;margin-left: 0;text-align: left;}#templateHeader {background-color: #F8F8F8;border-top: 1px solid #FFFFFF;border-bottom: 1px solid #CCCCCC;}.headerContent {font-family:'Lato', sans-serif;line-height: 100%;padding-top: 15px;padding-right: 0;padding-bottom: 15px;padding-left: 20px;text-align: left;vertical-align: middle;font-size:26px;font-weight:bold;color:#111111;}.headerContent a:link, .headerContent a:visited, .headerContent a .yshortcuts {color: #EB4102;font-weight: normal;text-decoration: underline;}#headerImage {height: auto;max-width: 600px;}#templateBody {background-color: #FFFFFF;border-top: 1px solid #FFFFFF;border-bottom: 1px solid #CCCCCC;}.bodyContent {font-family: 'Lato', sans-serif;font-size: 14px;line-height: 135%;color:rgb(142, 142, 147) !important;padding-top: 20px;padding-right: 20px;padding-bottom: 20px;padding-left: 20px;text-align: left;}.bodyContent a:link, .bodyContent a:visited, .bodyContent a .yshortcuts {color: #EB4102;font-weight: normal;text-decoration: underline;}.bodyContent img {display: inline;height: auto;max-width: 560px;}#templateFooter {background-color: #FFFFFF;}.footerContent {color: #808080;font-family: Helvetica;font-size: 10px;line-height: 100%;padding-top: 20px;padding-right: 20px;padding-bottom: 20px;padding-left: 20px;text-align: left;}.footerContent a:link, .footerContent a:visited, .footerContent a .yshortcuts, .footerContent a span {color: #606060;font-weight: normal;text-decoration: underline;}#address {background-color: #F8F8F8;border-top: 1px solid #CCCCCC;}@media only screen and (max-width: 480px) {body, table, td, p, a, li, blockquote {-webkit-text-size-adjust: none !important;}body {width: 100% !important;min-width: 100% !important;}#bodyCell {padding: 10px !important;}#templateContainer {max-width: 600px !important;width: 100% !important;}h1 {font-size: 24px !important;line-height: 100% !important;}h2 {font-size: 20px !important;line-height: 100% !important;}h3 {font-size: 18px !important;line-height: 100% !important;}h4 {font-size: 16px !important;line-height: 100% !important;}#headerImage {height: auto !important;max-width: 600px !important;width: 100% !important;}.headerContent {font-size: 20px !important;line-height: 125% !important;}.bodyContent {font-size: 18px !important;line-height: 125% !important;}.footerContent {font-size: 14px !important;line-height: 115% !important;}.footerContent a {display: block !important;}}"+
        
        
        "</style>"+
      "</head>" +
      "<body leftmargin='0' marginwidth='0' topmargin='0' marginheight='0' offset='0'>" +
          "<center>" +
              "<table align='center' border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>" +
                  "<tr>" +
                      "<td align='center' valign='top' id='bodyCell'>" +
                          "<table border='0' cellpadding='0' cellspacing='0' id='templateContainer'>" +
                              "<tr>" +
                                  "<td align='center' valign='top'>" +
                                      "<table border='0' cellpadding='0' cellspacing='0' width='100%' id='templateHeader'>" +
                                          "<tr>" +
                                              "<td valign='top' class='headerContent'>" +
                                              "</td>" +
                                          "</tr>" +
                                      "</table>" +
                                  "</td>" +
                              "</tr>" +
                              "<tr>" +
                                  "<td align='center' valign='top'>" +
                                      "<table border='0' cellpadding='0' cellspacing='0' width='100%' id='templateBody'>" +
                                          "<tr>" +
                                              "<td valign='top' class='bodyContent' mc:edit='body_content'>" +
                                                  "<h2>Welcome to Swift Serve</h2>" +
                                                  "To verify your email, you need to confirm your email by clicking below." +
                                              "</td>" +
                                          "</tr>" +
                                          "<tr>" +
                                              "<td align='center' valign='top'>" +
                                                  "<table border='0' cellpadding='0' cellspacing='0' width='100%'>" +
                                                      "<tr style='padding-top:0;'>" +
                                                          "<td align='center' valign='top'>" +
                                                              "<table border='0' cellpadding='30' cellspacing='0' width='500'>" +
                                                                  "<tr>" +
                                                                      "<td style='padding-top:0;' align='center' valign='top' width='500'>" +
                                                                          "<table border='0' cellpadding='0' cellspacing='0' width='70%' style='background-color:#FFFFFF;border-collapse:separate;border:1px solid #4e4e4e;'>" +
                                                                              "<tr>" +
                                                                                  "<td align='center' valign='middle' style='padding-top:15px;padding-bottom:15px;padding-right:15px;padding-left:15px;'>" +
                                                                                      "<a style='color:#4e4e4e;font-family:Open Sans, sans-serif;text-decoration:none;font-size:16px;line-height:100%;display:inline-block;font-weight:bold;' href='https://api.dev.swiftserve.us/api/users/v2/me/VerifyEmail?token="+ token + "'>" +
                                                                                          "<span style='text-decoration:none !important; text-decoration:none;'>Confirm Email Address</span>" +
                                                                                      "</a>" +
                                                                                  "</td>" +
                                                                              "</tr>" +
                                                                          "</table>" +
                                                                      "</td>" +
                                                                  "</tr>" +
                                                              "</table>" +
                                                          "</td>" +
                                                      "</tr>" +
                                                  "</table>" +
                                              "</td>" +
                                          "</tr>" +
                                          "<tr>" +
                                              "<td valign='top' class='bodyContent' mc:edit='body_content'>" +
                                                  "<p>Thanks</p>" +
                                                  "The SwiftServe Team" +
                                              "</td>" +
                                          "</tr>" +
                                      "</table>" +
                                  "</td>" +
                              "</tr>" +
                              "<tr>" +
                                  "<td align='center' valign='top'>" +
                                      "<table border='0' cellpadding='0' cellspacing='0' width='100%' id='address'>" +
                                          "<tr>" +
                                              "<td style='padding-top:10px;padding-bottom:20px;'>" +
                                                  "<table border='0' cellpadding='0' cellspacing='0' width='100%'>" +
                                                      "<tr>" +
                                                          "<td align='center' valign='top' style='font-family:Lato, sans-serif;font-size:13px;line-height:135%;color:#666666;'>" +
                                                             "If you received this email in error please forward this message to support@swiftserve.us" + 
                                                          "</td>" +
                                                      "</tr>" +
                                                  "</table>" +
                                              "</td>" +
                                          "</tr>" +
                                      "</table>" +
                                  "</td>" +
                              "</tr>" +
                          "</table>" +
                      "</td>" +
                  "</tr>" +
              "</table>" +
          "</center>" +
      "</body>"        
          },
            Text: {
             Charset: "UTF-8",
             Data: "TEXT_FORMAT_BODY"
            }
           },
           Subject: {
            Charset: 'UTF-8',
            Data: "Swift Serve Email Verification"
           }
          },
        Source: 'noreply@swiftserve.us', /* required */
        ReplyToAddresses: [
           'noreply@swiftserve.us',
          /* more items */
        ],
      };

      // Create the promise and SES service object
      // var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();
      var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
      // Handle promise's fulfilled/rejected states
      log("sending mail to customer.");
      sendPromise.then(
          function(data:any) {
          console.log(data);
          }).catch(
          function(err:any) {
          console.error(err, err.stack);
          });
  
  }
}

export default new AwsEmailService();
