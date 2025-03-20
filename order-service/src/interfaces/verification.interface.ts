export interface PhoneVerification {
    sendSms: (message:string,phoneNumber:string, res:any) => Promise<any>;
}