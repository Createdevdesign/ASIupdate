export interface AwsUploadAssets {
    uploadStoreAssetInS3Bucket: (imageData: any, store_id: string, type: string) => Promise<any>;
    deleteStoreAssetInS3Bucket: (pictureUrl:any) => Promise<any>;
}