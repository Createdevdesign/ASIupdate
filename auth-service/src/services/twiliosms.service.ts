
import { TwilioSmsVerification } from "../interfaces";
import debug from 'debug';

const accountSid = process.env.twillio_account_sid;
const authToken = process.env.twillio_token;
const twilioServiceId = process.env.twillio_service_sid;
const twilioClient = require("twilio")(accountSid, authToken);
const log: debug.IDebugger = debug('app:vonage-service');

class TwilioSmsService implements TwilioSmsVerification {

  async sendOtpToPhoneNumber(PhoneNumber:any){
    let sendEmail = {}
    await twilioClient.verify.services(twilioServiceId)
      .verifications.create({to: PhoneNumber, channel: "sms"})
      .then(verification_check => {
        sendEmail = verification_check;
      }).catch(error => {
        sendEmail=error
    });
    return sendEmail;
    // return new Promise(function(resolve, reject) {
    //   twilioClient.verify.services(twilioServiceId)
    //     .verifications.create({to: PhoneNumber, channel: "sms"}, (err, result) => {
    //       if (err) {
    //         console.error(err);
    //         reject(err);
    //       } else {
    //         console.log(result);
    //         resolve(result);
    //       }
    //     })
    //   })
  }
  async verifyOtpToPhoneNumber(verifyAuthLog:any, code:any){
    
    let sendEmail = {}
    await twilioClient.verify.services(twilioServiceId)
      .verificationChecks.create({to: verifyAuthLog.Sub, code:code})
      .then(verification_check => {
        sendEmail = verification_check;
      }).catch(error => {
        sendEmail=error
    });
    return sendEmail;
    // return new Promise(function(resolve, reject) {
    //   twilioClient.verify.services(twilioServiceId)
    //     .verifications.create({to: "+919985143623", code:code}, (err, result) => {
    //       if (err) {
    //         console.error(err);
    //         reject(err);
    //       } else {
    //         console.log(result);
    //         resolve(result);
    //       }
    //     })
    //   })
  }

}

export default new TwilioSmsService();
