import { AwsEmailVerification } from "../interfaces";
import debug from 'debug';
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,region: 'us-east-1'});

const log: debug.IDebugger = debug('app:vonage-service');

class AwsEmailService implements AwsEmailVerification {

  async sendEmailNotification(templateData:any,customerEmail:string,templateName:string){
    var params = {
        Destination: { /* required */
        ToAddresses: [
            customerEmail
            /* more To email addresses */
        ]
        },
        Source: 'noreply@swiftserve.us', /* required */
        Template: templateName, /* required */
        TemplateData:JSON.stringify(templateData),
        ReplyToAddresses: [
        'noreply@swiftserve.us'
        ],
    };
    
    // Create the promise and SES service object
    var sendPromise = await new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();
    log("sending mail to customer.", sendPromise);
    
    return sendPromise;
  }

}

export default new AwsEmailService();
