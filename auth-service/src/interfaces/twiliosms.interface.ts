export interface TwilioSmsVerification {
    sendOtpToPhoneNumber: (number:any) => Promise<any>;
    verifyOtpToPhoneNumber: (customer:any, body:any) => Promise<any>;
}