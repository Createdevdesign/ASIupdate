
import { TwilioSendEmail } from "../interfaces";
import debug from 'debug';
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,region: 'us-east-1'});

const log: debug.IDebugger = debug('app:aws-service');

class AwsEmailService implements TwilioSendEmail {

  public async sendEmailNotification(templateData:any,customerEmail:string,templateName:string, orderStatus:string, productData:any){
          
    var orderData:any =[]
      productData.filter((item:any) => orderData.push(
         '																	<tr>'+
      '																		<td>'+
      '																			<h3><b>'+ item.Name+' </b></h3>'+
      '																			<ul></ul>'+
      '																		</td>'+
      '																		<td align="right">'+templateData.PrimaryCurrencyCode + ' ' + item.Price+'</td>'+
      '																		<td align="right">'+ item.Quantity+'</td>'+
      '																		<td align="right">'+templateData.PrimaryCurrencyCode + ' ' + item.OrderSubTotal+'</td>'+
      '																	</tr>'
      ))
      var headers = templateData.paymentType === ""?orderStatus+ ', you have selected to '+templateData.paymentType+', please pay the total amount at the store. Your order details are below.':orderStatus+ ', you have selected to '+templateData.paymentType+'. Your order details are below.'
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
          Data: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
          '<html xmlns="http://www.w3.org/1999/xhtml">'+
          '<head>'+
          ''+
          '</head>'+
          ''+
          '<body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #f3f3e7; font-family:"Segoe UI Web (West European)",Segoe UI,-apple-system,BlinkMacSystemFont,Roboto,Helvetica Neue,sans-serif;">'+
          '	'+
          '	<div>'+
          '		<div class="rps_46ff">'+
          '			<div>'+
          '				<div>'+
          '					<div>'+
          '					</div>'+
          '					<div>'+
          '						<div>'+
          '							<div>'+
          '								<div>'+
          '									<div>'+
          '										<div dir="auto">'+
          '											<blockquote type="cite">'+
          '												<div dir="ltr">'+
          '													<div>'+
          '														<div>'+
          '															<br><br>Dear ' +  
                                          templateData.name+"," +
                                          '<br>'+headers+'<br>'+
          '																<h2>ORDER DETAILS</h2>'+
          '															</center>'+
          '															<table width="100%" cellspacing="0" cellpadding="4"'+
          '																id="x_x_x_m_-4342459412333156220carttable">'+
          '																<tbody>'+
          '																	<tr>'+
          '																		<td><b>Product</b></td>'+
          '																		<td align="right"><b>Unit Cost</b></td>'+
          '																		<td align="right"><b>Quantity</b></td>'+
          '																		<td align="right"><b>Sub Total</b></td>'+
          '																	</tr>'+ orderData.join("")+
          '																	<tr>'+
          '																		<td align="right" colspan="3"><b>Tax</b></td>'+
          '																		<td align="right"><b>'+templateData.PrimaryCurrencyCode + ' ' +templateData.orderTax+'</b></td>'+
          '																	</tr>'+
          '																	<tr id="x_x_x_m_-4342459412333156220tipRow">'+
          '																		<td align="right" colspan="3"><b>Tip</b></td>'+
          '																		<td align="right"><b>'+templateData.PrimaryCurrencyCode + ' ' +templateData.tipAmount+'</b></td>'+
          '																	</tr>'+
          '																	<tr id="x_x_x_m_-4342459412333156220tipRow">'+
          '																		<td align="right" colspan="3"><b>Discount</b>'+
          '																		</td>'+
          '																		<td align="right"><b>-'+templateData.PrimaryCurrencyCode + ' ' +templateData.orderDiscount+'</b></td>'+
          '																	</tr>'+
          '																	<tr>'+
          '																		<td align="right" colspan="3"><b>Total</b></td>'+
          '																		<td align="right"><b>'+templateData.PrimaryCurrencyCode + ' ' +templateData.OrderTotal+'</b></td>'+
          '																	</tr>'+
          '																</tbody>'+
          '															</table><br>'+
          '															<center>'+
          '																<h2>CONTACT DETAILS</h2>'+
          '															</center>'+
          '															<table align="center" cellspacing="2" cellpadding="4">'+
          '																<tbody>'+
          '																	<tr>'+
          '																		<td align="right"><b>Name:</b></td>'+
          '																		<td>'
                                                + templateData.name +
          '																	</tr>'+
          '																	<tr>'+
          '																		<td align="right"><b>Email Address:</b></td>'+
          '																		<td><a href="mailto:'+customerEmail+'"'+
          '																				target="_blank"'+
          '																				rel="noopener noreferrer"'+
          '																				data-auth="NotApplicable"'+
          '																				data-linkindex="0">'
                                                    +customerEmail+
          '																		</td>'+
          '																	</tr>'+
          '																	<tr>'+
          '																		<td align="right"><b>Phone #:</b></td>'+
          '																		<td>'
                                              + templateData.customerPhoneNumber + 
                                              '</td>' +
          '																	</tr>'+
          '																</tbody>'+
          '															</table><br>'+
          '															<center>'+
          '																<h2>STORE DETAILS</h2>'+
          '															</center>'+
          '															<table align="center" cellspacing="2" cellpadding="4">'+
          '																<tbody>'+
          '																	<tr>'+
          '																		<td align="right"><b>Name:</b></td>'+
          '																		<td>'
                                              + templateData.storeName + 
          '                                 </td>'+
          '																	</tr>'+
          '																	<tr>'+
          '																		<td align="right"><b>Email Address:</b></td>'+
          '																		<td><a href="mailto:'+ templateData.StoreEmail +'"'+
          '																				target="_blank"'+
          '																				rel="noopener noreferrer"'+
          '																				data-auth="NotApplicable"'+
          '																				data-linkindex="1">'+
                                                   templateData.StoreEmail + '</a>' +
          '																		</td>'+
          '																	</tr>'+
          '																	<tr>'+
          '																		<td align="right"><b>Address:</b></td>'+
          '																		<td>'+ templateData.storeAddress + '</td>'+
          '																	</tr>'+
          '																	<tr>'+
          '																		<td align="right"><b>Phone #:</b></td>'+
          '																		<td>'+ templateData.StorePhoneNumber + '</td>'+
          '																	</tr>'+
          '																</tbody>'+
          '															</table><br>'+
          '															<center>'+
          '																<h2>PAYMENT DETAILS</h2>'+
          '															</center>'+
          '															<table align="center" cellspacing="2" cellpadding="4">'+
          '																<tbody>'+
          '																	<tr>'+
          '																		<td align="right"><b>Reference Id: '+ templateData.paymentReferenceId +'</b></td>'+
          '																		<td></td>'+
          '																	</tr>'+
          '																</tbody>'+
          '															</table><br>'+
          '															<center><b>Payment Method: '+ templateData.paymentType +' ' + templateData.PrimaryCurrencyCode+ ' ' + templateData.OrderTotal+'</b></center>'+
          '															<br>'+
          '															<center><b>Note: Payment Transaction will show up as'+
          '																	\'SS*' + templateData.storeName +'\' on your credit card'+
          '																	statement.</b></center>'+
          '														</div>'+
          '													</div>'+
          '												</div>'+
          '											</blockquote>'+
          '										</div>'+
          '									</div>'+
          '								</div>'+
          '							</div>'+
          '						</div>'+
          '					</div>'+
          '				</div>'+
          '			</div>'+
          '		</div>'+
          '	</div>'+
          '</body>'+
          '</html>'        
          },
            Text: {
             Charset: "UTF-8",
             Data: "TEXT_FORMAT_BODY"
            }
           },
           Subject: {
            Charset: 'UTF-8',
            Data: templateData.storeName + ' : '+orderStatus+ ' Order# ' + templateData.orderNumber
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
