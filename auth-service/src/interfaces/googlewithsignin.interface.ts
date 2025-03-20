export interface GoogleSignInVerification {
    setRequestData(authType:string, idToken:string, requestBody:any): void;
    verifyAuthToken(res:any): Promise<any>;
}
export const APPLE_IDENTITY_URL = 'https://appleid.apple.com';
export const IOS_BUNDLE_ID = "com.swiftserve.store";
export const APPLE_CLIENT_ID = "";