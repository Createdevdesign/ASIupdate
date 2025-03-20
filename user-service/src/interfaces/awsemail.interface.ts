export interface AwsSendEmail {
    sendEmailNotification: (templateData:any,customerEmail:string,templateName:string, orderStatus:string, productData:any) => Promise<any>;
}