export interface TwilioEmailVerification {
    sendOtpToEmail: (email:any) => Promise<any>;
    verifyOtpToEmail: (customer:any, body:any) => Promise<any>;
}