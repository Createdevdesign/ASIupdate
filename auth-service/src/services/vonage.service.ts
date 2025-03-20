// import Vonage from "@vonage/server-sdk";
// import { PhoneVerification } from "../interfaces";
// import debug from 'debug';

// const VONAGE_API_KEY = process.env.VONAGE_API_KEY || "";
// const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET || "";
// const BRAND_NAME = "SwiftServe OTP";
// const log: debug.IDebugger = debug('app:vonage-service');
// const vonage = new Vonage({
//     apiKey: VONAGE_API_KEY,
//     apiSecret: VONAGE_API_SECRET
// });

// class VonageService implements PhoneVerification {

//     async sendOTP(phoneNumber: string) {
//         return new Promise(function(resolve, reject) {
//           vonage.verify.request({
//             number: phoneNumber,
//             brand: BRAND_NAME
//           }, (err, result) => {
//             if (err) {
//               console.error(err);
//               reject(err)
//               log(`OTP error + ${err}`);
//             } else {
//               // const verifyRequestId = result.request_id;
//               // log(`request_id + ${verifyRequestId}`);
//               // console.log('request_id', verifyRequestId);
//               resolve(result)
//             }
//           });
//         })
        
//     }

//     async verifyOTP(requestId: string, verificationCode: string) {
//       return new Promise(function(resolve, reject) {
//         vonage.verify.check({
//             request_id: requestId,
//             code: verificationCode
//           }, (err, result) => {
//             if (err) {
//               console.error(err);
//               reject(err);
//             } else {
//               console.log(result);
//               resolve(result);
//             }
//           });
//         })
//     }

// }

// export default new VonageService();
