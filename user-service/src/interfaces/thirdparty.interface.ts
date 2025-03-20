export interface AwsEmailVerification {
    sendEmailNotification: (templateData:any,customerEmail:string,templateName:string) => Promise<any>;
    uploaduserImageInS3Bucket: (imageData: any, customerId: string) => Promise<any>;
    deleteUserImageInS3Bucket: (pictureUrl:any) => Promise<any>;
}