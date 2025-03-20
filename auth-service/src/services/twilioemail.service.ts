
import { TwilioEmailVerification } from "../interfaces";
import debug from 'debug';

const accountSid = process.env.twillio_account_sid || 'ACasd';
const authToken = process.env.twillio_token || 'a';
const twilioServiceId = process.env.twillio_service_sid || 'VAa';
const twilioClient = require("twilio")(accountSid, authToken);
const log: debug.IDebugger = debug('app:vonage-service');

class TwilioEmailService implements TwilioEmailVerification {

  async sendOtpToEmail(customer:any){
    let sendEmail = {}
    await twilioClient.verify.services(twilioServiceId)
      .verifications.create({to: customer.Email, channel: "email"})
      .then(verification_check => {
        sendEmail = verification_check;
      }).catch(error => {
        sendEmail=error
    });
    return sendEmail;
  }
  async verifyOtpToEmail(customer:any, body:any){
    let sendEmail = {}
    
    console.log("sendEmail " + body.userCode)
    await twilioClient.verify.services(twilioServiceId)
      .verificationChecks.create({to: customer.Email, code:body.userCode, })
      .then(verification_check => {
        sendEmail = verification_check;
      }).catch(error => {
        sendEmail=error
    });
    return sendEmail;
  }

}

export default new TwilioEmailService();
