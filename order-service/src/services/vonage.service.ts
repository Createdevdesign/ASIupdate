import Vonage from "@vonage/server-sdk";
import { PhoneVerification } from "../interfaces";
import debug from 'debug';

const VONAGE_API_KEY = process.env.VONAGE_API_KEY || "";
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET || "";
const BRAND_NAME = "SwiftServe OTP";
const log: debug.IDebugger = debug('app:vonage-service');
const vonage:any = new Vonage({
    apiKey: VONAGE_API_KEY,
    apiSecret: VONAGE_API_SECRET
});

class VonageService implements PhoneVerification {

    async sendSms(message:string,phoneNumber:string, res:any) {
        return new Promise(function(resolve, reject) {
            const from = "Vonage APIs"
            const to = phoneNumber
            const text = message
            console.log("phoneNumber " + phoneNumber)
            if(!phoneNumber){
                reject({"phoneNumber":phoneNumber})
            }
            
            vonage.message.sendSms(from, to, text, (err:any, responseData:any) => {
                if (err) {
                    console.error(err);
                    reject(err)
                } else {
                    resolve(responseData)
                }
            })
        });        
    }

}

export default new VonageService();
