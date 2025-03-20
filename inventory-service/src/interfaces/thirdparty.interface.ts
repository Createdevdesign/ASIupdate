export interface AwsUploadAssets {
    uploadProductImageInS3Bucket: (imageData: any, productId: string) => Promise<any>;
    deleteProductImageInS3Bucket: (pictureUrl:any) => Promise<any>;
}