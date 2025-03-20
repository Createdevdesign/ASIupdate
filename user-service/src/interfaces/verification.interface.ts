export interface PhoneVerification {
    sendOTP: (phoneNumber: string) => Promise<any>;
    verifyOTP: (requestId: string, verificationCode: string) => Promise<any>;
}