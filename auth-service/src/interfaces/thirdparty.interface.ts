export interface AwsEmailVerification {
    sendEmailNotification: (templateData:any,customerEmail:string,templateName:string) => Promise<any>;
}